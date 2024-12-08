import {exec, execFile} from 'node:child_process';
import {homedir} from 'node:os';
import {dirname, join} from 'node:path';
import {promisify} from 'node:util';

import {existsSync, readdirSync} from 'graceful-fs';
import {isNil} from 'lodash';
import {platform} from 'os';

import {findFileInDir, parseVersion, removeDir} from '../PythonUtils';

const execAsync = promisify(exec);

const defaultPackageCachePath = join(homedir(), 'AppData', 'Local', 'Package Cache');

export async function uninstallOfficialPython(pythonPath: string): Promise<{success: boolean; message: string}> {
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
  } catch (err: any) {
    return {
      success: false,
      message: `Uninstallation failed: ${err.message}`,
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
      message: 'Successfully removed Python installation with uninstaller',
    };
  } catch (err) {
    console.log(err);
    try {
      await removeDir(dirname(pythonPath));
      await cleanupWindowsRegistry(versionString);
      await removePythonFromPath(pythonPath);
      return {
        success: true,
        message: 'Successfully removed Python installation manually',
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Failed to uninstall Python on Windows: ${err.message}`,
      };
    }
  }
}

function findPythonInstallerByVersion(version: string): string | null {
  try {
    const directories = readdirSync(defaultPackageCachePath);

    const normalizedVersion = version.trim();

    let fileName: string | null = null;

    directories.find(dir => {
      fileName = findFileInDir(join(defaultPackageCachePath, dir), `python-${normalizedVersion}`);
      return !isNil(fileName);
    });

    if (!fileName) {
      console.log(`No installer found for Python version ${version}`);
      return null;
    }

    return fileName;
  } catch (error) {
    console.error('Error searching for Python installers:', error);
    return null;
  }
}

async function uninstallPythonWindows(installerPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!existsSync(installerPath)) {
      return reject(new Error(`Installer not found at ${installerPath}`));
    }

    const uninstallArgs = ['/uninstall', '/quiet'];

    console.log(installerPath, uninstallArgs);

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

async function cleanupWindowsRegistry(version: string): Promise<void> {
  const registryKeys = [
    `HKLM\\SOFTWARE\\Python\\PythonCore\\${version}`,
    `HKCU\\SOFTWARE\\Python\\PythonCore\\${version}`,
    `HKLM\\SOFTWARE\\WOW6432Node\\Python\\PythonCore\\${version}`,
  ];

  for (const registryKey of registryKeys) {
    try {
      await execAsync(`reg delete "${registryKey}" /f`, {
        shell: 'powershell.exe',
      });
      console.log(`Successfully deleted registry key: ${registryKey}`);
    } catch (error: any) {
      console.warn(`Error deleting registry key ${registryKey}: ${error.message}`);
    }
  }
}

async function removePythonFromPath(pythonPath: string): Promise<void> {
  try {
    const {stdout: currentPath} = await execAsync('reg query "HKEY_CURRENT_USER\\Environment" /v Path');

    const match = currentPath.match(/REG_\w+\s+(.+)/);
    if (!match) {
      throw new Error('Failed to retrieve current PATH');
    }

    const paths = match[1].split(';').filter(Boolean);
    const nonPythonPaths = paths.filter(path => !path.toLowerCase().includes(pythonPath.toLowerCase()));

    if (paths.length === nonPythonPaths.length) {
      console.log('No Python paths found in PATH');
      return;
    }

    const newPathValue = nonPythonPaths.join(';');

    const regCommand = `REG ADD "HKEY_CURRENT_USER\\Environment" /v Path /t REG_EXPAND_SZ /d "${newPathValue}" /f`;

    await execAsync(regCommand);

    process.env.PATH = newPathValue;

    console.log('Python paths removed successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to remove Python from PATH: ${errorMessage}`);
  }
}
