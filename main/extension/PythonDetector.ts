import path from 'node:path';

import {exec} from 'child_process';
import {existsSync, promises as fs} from 'fs';
import {arch, homedir, platform} from 'os';
import {join} from 'path';
import regedit from 'regedit';
import {promisify} from 'util';
import which from 'which';

const execAsync = promisify(exec);

type PythonInstallation = {
  version: string;
  majorVersion: number;
  minorVersion: number;
  patchVersion: number;
  installationType: 'official' | 'conda' | 'pyenv' | 'other';
  architecture: '32bit' | '64bit';
  buildArchitecture: '32bit' | '64bit';
  installPath: string;
  installFolder: string;
  pipPath?: string;
  venvPaths: string[];
  sitePackagesPath: string;
  isDefault: boolean;
};

export default class PythonDetector {
  private readonly commonPaths: {[key: string]: string[]} = {
    win32: [
      'C:\\Python*',
      'C:\\Program Files\\Python*',
      'C:\\Program Files (x86)\\Python*',
      '%LOCALAPPDATA%\\Programs\\Python*',
      '%USERPROFILE%\\AppData\\Local\\Programs\\Python*',
      '%USERPROFILE%\\Anaconda3',
      '%USERPROFILE%\\Miniconda3',
    ],
    darwin: [
      '/usr/local/bin/python*',
      '/usr/bin/python*',
      '/opt/homebrew/bin/python*',
      '~/anaconda3',
      '~/miniconda3',
      '/Library/Frameworks/Python.framework/Versions/*',
    ],
    linux: ['/usr/bin/python*', '/usr/local/bin/python*', '~/anaconda3', '~/miniconda3', '/opt/python*'],
  };

  private async getRegistryPythonPaths(): Promise<string[]> {
    if (platform() !== 'win32') return [];

    return new Promise(resolve => {
      const paths: string[] = [];
      regedit.list(
        [
          'HKLM\\SOFTWARE\\Python\\PythonCore',
          'HKCU\\SOFTWARE\\Python\\PythonCore',
          'HKLM\\SOFTWARE\\WOW6432Node\\Python\\PythonCore',
        ],
        (err, result) => {
          if (err) {
            resolve([]); // Return empty array on error
            return;
          }

          Object.values(result).forEach(key => {
            if (key.exists) {
              Object.keys(key.keys).forEach(version => {
                const installPath = key.values[`${version}\\InstallPath`]?.value;
                if (installPath) paths.push(installPath.toString());
              });
            }
          });
          resolve(paths);
        },
      );
    });
  }

  private async findPythonInPath(): Promise<string[]> {
    try {
      const paths: string[] = [];
      const pythonCommands = ['python', 'python3'];

      for (const cmd of pythonCommands) {
        try {
          const path = await which(cmd);
          if (path) paths.push(path);
        } catch (error) {
          // Command not found, continue
        }
      }

      return paths;
    } catch (error) {
      return [];
    }
  }

  private async findInCommonLocations(): Promise<string[]> {
    const os = platform();
    const paths = this.commonPaths[os] || [];
    const expandedPaths: string[] = [];

    for (const path of paths) {
      const expandedPath = path
        .replace('%LOCALAPPDATA%', process.env.LOCALAPPDATA || '')
        .replace('%USERPROFILE%', homedir())
        .replace('~', homedir());

      try {
        const files = await fs.readdir(expandedPath);
        expandedPaths.push(...files.map(file => join(expandedPath, file)));
      } catch (error) {
        // Directory doesn't exist or is inaccessible
      }
    }

    return expandedPaths;
  }

  private async detectInstallationType(pythonPath: string): Promise<'official' | 'conda' | 'pyenv' | 'other'> {
    if (pythonPath.includes('conda')) return 'conda';
    if (pythonPath.includes('.pyenv')) return 'pyenv';

    try {
      const {stdout} = await execAsync(`"${pythonPath}" -c "import sys; print(sys.prefix)"`);
      if (stdout.includes('conda')) return 'conda';
      if (stdout.includes('.pyenv')) return 'pyenv';
      return 'official';
    } catch (error) {
      return 'other';
    }
  }

  private async parseVersion(pythonPath: string): Promise<{major: number; minor: number; patch: number}> {
    try {
      const {stdout} = await execAsync(`"${pythonPath}" --version`);
      const version = stdout.trim().split(' ')[1];
      const [major, minor, patch] = version.split('.').map(Number);
      return {major, minor, patch};
    } catch (error) {
      throw new Error(`Failed to parse Python version: ${error}`);
    }
  }

  private async detectArchitecture(pythonPath: string): Promise<'32bit' | '64bit'> {
    try {
      const {stdout} = await execAsync(`"${pythonPath}" -c "import struct; print(struct.calcsize('P') * 8)"`);
      return stdout.trim() === '64' ? '64bit' : '32bit';
    } catch (error) {
      return arch() === 'x64' ? '64bit' : '32bit';
    }
  }

  private async detectBuildArchitecture(pythonPath: string): Promise<'32bit' | '64bit'> {
    try {
      const {stdout} = await execAsync(`"${pythonPath}" -c "import platform; print(platform.architecture()[0])"`);
      return stdout.trim() === '64bit' ? '64bit' : '32bit';
    } catch (error) {
      return arch() === 'x64' ? '64bit' : '32bit';
    }
  }

  private async getPipPath(pythonPath: string): Promise<string | undefined> {
    try {
      const {stdout} = await execAsync(`"${pythonPath}" -m pip --version`);
      const pipPath = stdout.split(' ')[1];
      return existsSync(pipPath) ? pipPath : undefined;
    } catch (error) {
      return undefined;
    }
  }

  private async getVenvPaths(pythonPath: string): Promise<string[]> {
    try {
      const {stdout} = await execAsync(`"${pythonPath}" -c "import sys; print('\\n'.join(sys.path))"`);
      return stdout
        .split('\n')
        .filter(path => path.includes('venv') || path.includes('virtualenv'))
        .map(path => path.trim());
    } catch (error) {
      return [];
    }
  }

  private async getSitePackagesPath(pythonPath: string): Promise<string> {
    try {
      const {stdout} = await execAsync(`"${pythonPath}" -c "import site; print(site.getsitepackages()[0])"`);
      return stdout.trim();
    } catch (error) {
      throw new Error(`Failed to get site-packages location: ${error}`);
    }
  }

  private async isDefaultPython(pythonPath: string): Promise<boolean> {
    try {
      const defaultPath = await which('python');
      return defaultPath === pythonPath;
    } catch (error) {
      return false;
    }
  }

  public async detectPythonInstallations(): Promise<PythonInstallation[]> {
    const installations: PythonInstallation[] = [];
    const paths = new Set<string>();

    // Collect paths from all sources
    const pathSources = await Promise.all([
      this.findPythonInPath(),
      this.getRegistryPythonPaths(),
      this.findInCommonLocations(),
    ]);

    pathSources.flat().forEach(path => paths.add(path));

    // Analyze each unique Python installation
    for (const pythonPath of paths) {
      try {
        const version = await this.parseVersion(pythonPath);
        const isDefault = await this.isDefaultPython(pythonPath);
        const installation: PythonInstallation = {
          version: `${version.major}.${version.minor}.${version.patch}`,
          majorVersion: version.major,
          minorVersion: version.minor,
          patchVersion: version.patch,
          installationType: await this.detectInstallationType(pythonPath),
          architecture: await this.detectArchitecture(pythonPath),
          buildArchitecture: await this.detectBuildArchitecture(pythonPath),
          installPath: pythonPath,
          installFolder: path.dirname(pythonPath),
          pipPath: await this.getPipPath(pythonPath),
          venvPaths: await this.getVenvPaths(pythonPath),
          sitePackagesPath: await this.getSitePackagesPath(pythonPath),
          isDefault,
        };
        installations.push(installation);
      } catch (error) {
        console.error(`Error analyzing Python installation at ${pythonPath}:`, error);
      }
    }

    return installations;
  }

  async uninstallPython(pythonPath: string): Promise<{success: boolean; message: string}> {
    try {
      const installType = await this.detectInstallationType(pythonPath);

      // Verify the python installation exists
      if (!existsSync(pythonPath)) {
        return {
          success: false,
          message: `Python installation not found at ${pythonPath}`,
        };
      }

      // Handle different installation types
      switch (installType) {
        case 'conda':
          return await this.uninstallCondaPython(pythonPath);
        case 'pyenv':
          return await this.uninstallPyenvPython(pythonPath);
        case 'official':
          return await this.uninstallOfficialPython(pythonPath);
        default:
          return {
            success: false,
            message: `Unknown installation type: ${installType}`,
          };
      }
    } catch (error) {
      return {
        success: false,
        // @ts-ignore-next-line
        message: `Uninstallation failed: ${error.message}`,
      };
    }
  }

  private async uninstallCondaPython(pythonPath: string): Promise<{success: boolean; message: string}> {
    try {
      const envName = await this.getCondaEnvName(pythonPath);
      await execAsync(`conda env remove -n ${envName} -y`);
      return {
        success: true,
        message: `Successfully removed conda environment ${envName}`,
      };
    } catch (error) {
      return {
        success: false,
        // @ts-ignore-next-line
        message: `Failed to remove conda environment: ${error.message}`,
      };
    }
  }

  private async uninstallPyenvPython(pythonPath: string): Promise<{success: boolean; message: string}> {
    try {
      const version = await this.parseVersion(pythonPath);
      const versionString = `${version.major}.${version.minor}.${version.patch}`;
      await execAsync(`pyenv uninstall -f ${versionString}`);
      return {
        success: true,
        message: `Successfully uninstalled Python ${versionString} from pyenv`,
      };
    } catch (error) {
      return {
        success: false,
        // @ts-ignore-next-line
        message: `Failed to uninstall from pyenv: ${error.message}`,
      };
    }
  }

  private async uninstallOfficialPython(pythonPath: string): Promise<{success: boolean; message: string}> {
    const os = platform();

    try {
      switch (os) {
        case 'win32':
          return await this.uninstallWindowsPython(pythonPath);
        case 'darwin':
          return await this.uninstallMacOSPython(pythonPath);
        case 'linux':
          return await this.uninstallLinuxPython(pythonPath);
        default:
          return {
            success: false,
            message: `Unsupported operating system: ${os}`,
          };
      }
    } catch (error) {
      return {
        success: false,
        // @ts-ignore-next-line
        message: `Uninstallation failed: ${error.message}`,
      };
    }
  }

  private async uninstallWindowsPython(pythonPath: string): Promise<{success: boolean; message: string}> {
    try {
      // Get uninstall string from registry
      const uninstallKey = await this.getWindowsUninstallKey(pythonPath);

      if (uninstallKey) {
        // Execute uninstaller silently
        await execAsync(`${uninstallKey} /quiet /uninstall`);
        return {
          success: true,
          message: 'Successfully uninstalled Python using Windows installer',
        };
      } else {
        // Fallback to manual removal
        await this.removeDirectory(pythonPath);
        await this.cleanupWindowsRegistry();
        return {
          success: true,
          message: 'Successfully removed Python installation manually',
        };
      }
    } catch (error) {
      return {
        success: false,
        // @ts-ignore-next-line
        message: `Failed to uninstall Python on Windows: ${error.message}`,
      };
    }
  }

  private async uninstallMacOSPython(pythonPath: string): Promise<{success: boolean; message: string}> {
    try {
      // Check if it's a framework installation
      const isFramework = pythonPath.includes('Python.framework');

      if (isFramework) {
        const frameworkPath = pythonPath.split('/Python.framework')[0] + '/Python.framework';
        await this.removeDirectory(frameworkPath);
      } else {
        await this.removeDirectory(pythonPath);
      }

      // Remove symlinks
      const binPath = '/usr/local/bin';
      const version = await this.parseVersion(pythonPath);
      const versionString = `${version.major}.${version.minor}`;

      const symlinks = [
        `python${versionString}`,
        `pip${versionString}`,
        `python${version.major}`,
        `pip${version.major}`,
      ];

      for (const link of symlinks) {
        try {
          await fs.unlink(join(binPath, link));
        } catch (error) {
          // Ignore errors for non-existent symlinks
        }
      }

      return {
        success: true,
        message: 'Successfully uninstalled Python on macOS',
      };
    } catch (error) {
      return {
        success: false,
        // @ts-ignore-next-line
        message: `Failed to uninstall Python on macOS: ${error.message}`,
      };
    }
  }

  private async uninstallLinuxPython(pythonPath: string): Promise<{success: boolean; message: string}> {
    try {
      // Check if installed via package manager
      const {stdout: packageManager} = await execAsync('which apt-get || which dnf || which yum');

      if (packageManager) {
        const version = await this.parseVersion(pythonPath);
        const packageName = `python${version.major}.${version.minor}`;

        if (packageManager.includes('apt-get')) {
          await execAsync(`sudo apt-get remove -y ${packageName}`);
        } else if (packageManager.includes('dnf')) {
          await execAsync(`sudo dnf remove -y ${packageName}`);
        } else if (packageManager.includes('yum')) {
          await execAsync(`sudo yum remove -y ${packageName}`);
        }
      } else {
        // Manual installation, remove directory
        await this.removeDirectory(pythonPath);
      }

      return {
        success: true,
        message: 'Successfully uninstalled Python on Linux',
      };
    } catch (error) {
      return {
        success: false,
        // @ts-ignore-next-line
        message: `Failed to uninstall Python on Linux: ${error.message}`,
      };
    }
  }

  private async getCondaEnvName(pythonPath: string): Promise<string> {
    try {
      const {stdout} = await execAsync(`"${pythonPath}" -c "import sys; print(sys.prefix.split('/')[-1])"`);
      return stdout.trim();
    } catch (error) {
      // @ts-ignore-next-line
      throw new Error(`Failed to get conda environment name: ${error.message}`);
    }
  }

  private async getWindowsUninstallKey(pythonPath: string): Promise<string | null> {
    return new Promise(resolve => {
      regedit.list(
        [
          'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
          'HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
        ],
        (err, result) => {
          if (err) {
            resolve(null);
            return;
          }

          let uninstallString = null;
          Object.values(result).forEach(key => {
            if (key.exists) {
              Object.values(key.values).forEach(value => {
                // @ts-ignore-next-line
                if (value.value?.includes('Python') && value.value?.includes(pythonPath)) {
                  // @ts-ignore-next-line
                  uninstallString = value.value;
                }
              });
            }
          });
          resolve(uninstallString);
        },
      );
    });
  }

  private async cleanupWindowsRegistry(): Promise<void> {
    const registryKeys = [
      'HKLM\\SOFTWARE\\Python\\PythonCore',
      'HKCU\\SOFTWARE\\Python\\PythonCore',
      'HKLM\\SOFTWARE\\WOW6432Node\\Python\\PythonCore',
    ];

    return new Promise(resolve => {
      regedit.deleteKey(registryKeys, err => {
        if (err) {
          console.warn(`Warning: Failed to clean registry keys: ${err.message}`);
        }
        resolve();
      });
    });
  }

  private async removeDirectory(path: string): Promise<void> {
    try {
      await fs.rm(path, {recursive: true, force: true});
    } catch (error) {
      // @ts-ignore-next-line
      throw new Error(`Failed to remove directory ${path}: ${error.message}`);
    }
  }
}
