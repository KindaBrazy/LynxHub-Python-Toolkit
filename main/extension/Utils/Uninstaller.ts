import {exec, execFile} from 'node:child_process';
import {readdirSync} from 'node:fs';
import {homedir} from 'node:os';
import path, {dirname} from 'node:path';
import {promisify} from 'node:util';

import {existsSync} from 'graceful-fs';
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
  const version = await parseVersion(pythonPath);
  const versionString = `${version.major}.${version.minor}`;

  try {
    const installerToUninstall = findPythonInstallerByVersion(versionString);

    if (!installerToUninstall) {
      throw new Error(`No Python installer found for version ${version}`);
    }

    await uninstallPythonWindows(installerToUninstall);
    return {
      success: true,
      message: 'Successfully removed Python installation manually',
    };
  } catch {
    try {
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
}

async function uninstallPythonWindows(installerPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Verify installer exists
    if (!existsSync(installerPath)) {
      return reject(new Error(`Installer not found at ${installerPath}`));
    }

    // Construct uninstall arguments
    const uninstallArgs = [
      '/uninstall',
      '/quiet', // Similar to silent mode
    ];

    // Execute the uninstaller
    execFile(installerPath, uninstallArgs, (error, stdout) => {
      if (error) {
        console.error('Uninstall error:', error);
        return reject(error);
      }

      console.log('Python uninstall output:', stdout);
      resolve('Python uninstalled successfully');
    });
  });
}

const defaultPackageCachePath = path.join(homedir(), 'AppData', 'Local', 'Package Cache');

function findPythonInstallerByVersion(version: string): string | null {
  try {
    // Read directories in Package Cache
    const directories = readdirSync(defaultPackageCachePath);

    // Normalize version input (remove any leading/trailing whitespace)
    const normalizedVersion = version.trim();

    // Find matching installer
    const matchingInstaller = directories.find(
      dir =>
        // Check if directory contains the exact version
        dir.includes(`python-${normalizedVersion}`) && dir.endsWith('-amd64.exe'),
    );

    if (!matchingInstaller) {
      console.log(`No installer found for Python version ${version}`);
      return null;
    }

    // Construct full path to the installer
    return path.join(defaultPackageCachePath, matchingInstaller, `python-${normalizedVersion}-amd64.exe`);
  } catch (error) {
    console.error('Error searching for Python installers:', error);
    return null;
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
      case 'linux':
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
