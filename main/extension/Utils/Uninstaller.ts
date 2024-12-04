import {exec} from 'node:child_process';
import {dirname, join} from 'node:path';
import {promisify} from 'node:util';

import {existsSync, promises} from 'graceful-fs';
import {platform} from 'os';

import {removeDir} from '../../Managements/Ipc/Methods/IpcMethods';
import {detectInstallationType} from './PythonUtils';

const execAsync = promisify(exec);

async function uninstallCondaPython(pythonPath: string): Promise<{success: boolean; message: string}> {
  try {
    const envName = await getCondaEnvName(pythonPath);
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

async function uninstallWindowsPython(pythonPath: string): Promise<{success: boolean; message: string}> {
  try {
    const version = await parseVersion(pythonPath);
    const versionString = `${version.major}.${version.minor}`;
    console.log('versionString', versionString);

    // Fallback to manual removal
    await removeDir(dirname(pythonPath));
    await cleanupWindowsRegistry(versionString);
    await removePythonFromPath();
    return {
      success: true,
      message: 'Successfully removed Python installation manually',
    };
  } catch (error) {
    return {
      success: false,
      // @ts-ignore-next-line
      message: `Failed to uninstall Python on Windows: ${error.message}`,
    };
  }
}

async function uninstallMacOSPython(pythonPath: string): Promise<{success: boolean; message: string}> {
  try {
    // Check if it's a framework installation
    const isFramework = pythonPath.includes('Python.framework');

    if (isFramework) {
      const frameworkPath = pythonPath.split('/Python.framework')[0] + '/Python.framework';
      await removeDir(frameworkPath);
    } else {
      await removeDir(pythonPath);
    }

    // Remove symlinks
    const binPath = '/usr/local/bin';
    const version = await parseVersion(pythonPath);
    const versionString = `${version.major}.${version.minor}`;

    const symlinks = [`python${versionString}`, `pip${versionString}`, `python${version.major}`, `pip${version.major}`];

    for (const link of symlinks) {
      try {
        await promises.unlink(join(binPath, link));
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

async function uninstallLinuxPython(pythonPath: string): Promise<{success: boolean; message: string}> {
  try {
    // Check if installed via package manager
    const {stdout: packageManager} = await execAsync('which apt-get || which dnf || which yum');

    if (packageManager) {
      const version = await parseVersion(pythonPath);
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
      await removeDir(pythonPath);
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

async function parseVersion(pythonPath: string): Promise<{major: number; minor: number; patch: number}> {
  try {
    const {stdout} = await execAsync(`"${pythonPath}" --version`);
    const version = stdout.trim().split(' ')[1];
    const [major, minor, patch] = version.split('.').map(Number);
    return {major, minor, patch};
  } catch (error) {
    throw new Error(`Failed to parse Python version: ${error}`);
  }
}

async function getCondaEnvName(pythonPath: string): Promise<string> {
  try {
    const {stdout} = await execAsync(`"${pythonPath}" -c "import sys; print(sys.prefix.split('/')[-1])"`);
    return stdout.trim();
  } catch (error) {
    // @ts-ignore-next-line
    throw new Error(`Failed to get conda environment name: ${error.message}`);
  }
}

const execPromise = promisify(exec);

async function cleanupWindowsRegistry(version: string): Promise<void> {
  const registryKeys = [
    `HKLM\\SOFTWARE\\Python\\PythonCore\\${version}`,
    `HKCU\\SOFTWARE\\Python\\PythonCore\\${version}`,
    `HKLM\\SOFTWARE\\WOW6432Node\\Python\\PythonCore\\${version}`,
  ];

  for (const registryKey of registryKeys) {
    try {
      await execPromise(`reg delete "${registryKey}" /f`, {
        shell: 'powershell.exe',
      });
      console.log(`Successfully deleted registry key: ${registryKey}`);
    } catch (error: any) {
      console.warn(`Error deleting registry key ${registryKey}: ${error.message}`);
    }
  }
}

async function removePythonFromPath(): Promise<void> {
  try {
    // Get current user's PATH from registry
    const {stdout: currentPath} = await execAsync('reg query "HKEY_CURRENT_USER\\Environment" /v Path');

    // Extract the current PATH value
    const match = currentPath.match(/REG_\w+\s+(.+)/);
    if (!match) {
      throw new Error('Failed to retrieve current PATH');
    }

    // Get existing paths and filter out Python-related paths
    const paths = match[1].split(';').filter(Boolean);
    const nonPythonPaths = paths.filter(path => !path.toLowerCase().includes('python'));

    // If no paths were removed, return early
    if (paths.length === nonPythonPaths.length) {
      console.log('No Python paths found in PATH');
      return;
    }

    // Construct new PATH value
    const newPathValue = nonPythonPaths.join(';');

    // Use REG ADD with proper escaping and quotes
    const regCommand = `REG ADD "HKEY_CURRENT_USER\\Environment" /v Path /t REG_EXPAND_SZ /d "${newPathValue}" /f`;

    // Execute the registry update
    await execAsync(regCommand);

    // Update current process PATH
    process.env.PATH = newPathValue;

    console.log('Python paths removed successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to remove Python from PATH: ${errorMessage}`);
  }
}

async function uninstallOfficialPython(pythonPath: string): Promise<{success: boolean; message: string}> {
  const os = platform();

  try {
    switch (os) {
      case 'win32':
        return await uninstallWindowsPython(pythonPath);
      case 'darwin':
        return await uninstallMacOSPython(pythonPath);
      case 'linux':
        return await uninstallLinuxPython(pythonPath);
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

export default async function uninstallPython(pythonPath: string): Promise<{success: boolean; message: string}> {
  try {
    const installType = await detectInstallationType(pythonPath);

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
        return await uninstallCondaPython(pythonPath);
      case 'official':
        return await uninstallOfficialPython(pythonPath);
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
