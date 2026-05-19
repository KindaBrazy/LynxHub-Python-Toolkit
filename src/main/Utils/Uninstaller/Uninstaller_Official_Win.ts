import {exec, execFile} from 'node:child_process';
import {homedir} from 'node:os';
import {dirname, join} from 'node:path';
import {promisify} from 'node:util';

import {determineShell} from '@lynx_main/utils';
import {existsSync, readdirSync} from 'graceful-fs';
import {isNil} from 'lodash-es';

import {findFileInDir, parseVersion, removeDir} from '../PythonUtils';

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);

const defaultPackageCachePath = join(homedir(), 'AppData', 'Local', 'Package Cache');

export async function uninstallWindowsPython(pythonPath: string): Promise<{success: boolean; message: string}> {
  const version = await parseVersion(pythonPath);
  const versionString = `${version.major}.${version.minor}`;

  try {
    const installerToUninstall = findPythonInstallerByVersion(versionString);

    if (!installerToUninstall) {
      return {
        success: false,
        message: `No Python installer found for version ${version}`,
      };
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
  return new Promise(async (resolve, reject) => {
    try {
      const powershellExe = determineShell();

      const getCmd = `[Environment]::GetEnvironmentVariable('Path', 'User')`;
      const {stdout} = await execFileAsync(powershellExe, ['-NoProfile', '-Command', getCmd]);

      const currentUserPath = stdout.trim();
      if (!currentUserPath) {
        console.log('No user PATH found');
        return resolve();
      }

      const paths = currentUserPath.split(';').filter(Boolean);
      const nonPythonPaths = paths.filter(p => !p.toLowerCase().includes(pythonPath.toLowerCase()));

      if (paths.length === nonPythonPaths.length) {
        console.log('No Python paths found in PATH');
        return resolve();
      }

      const newPathValue = nonPythonPaths.join(';');

      const base64Path = Buffer.from(newPathValue, 'utf16le').toString('base64');
      const setCmd = `
        $path = [System.Text.Encoding]::Unicode.GetString([System.Convert]::FromBase64String('${base64Path}'))
        [Environment]::SetEnvironmentVariable('Path', $path, 'User')
      `;

      await execFileAsync(powershellExe, ['-NoProfile', '-Command', setCmd]);

      // Carefully modify `process.env.PATH` without blowing out `System32` etc
      if (process.env.PATH) {
        process.env.PATH = process.env.PATH.split(';')
          .filter(Boolean)
          .filter(p => !p.toLowerCase().includes(pythonPath.toLowerCase()))
          .join(';');
      }

      console.log('Python paths removed successfully');
      resolve();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      reject(new Error(`Failed to remove Python from PATH: ${errorMessage}`));
    }
  });
}
