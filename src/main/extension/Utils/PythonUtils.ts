import {join, resolve} from 'node:path';

import {exec} from 'child_process';
import {BrowserWindow, dialog, OpenDialogOptions, OpenDialogReturnValue} from 'electron';
import {existsSync, promises, readdirSync, statSync} from 'graceful-fs';
import {isNil} from 'lodash';
import {promisify} from 'util';

import {PythonInstallation} from '../../../cross/extension/CrossExtTypes';

const execAsync = promisify(exec);

export async function detectInstallationType(pythonPath: string): Promise<PythonInstallation['installationType']> {
  const normalize = (str: string) => str.toLowerCase();

  try {
    if (!existsSync(pythonPath)) {
      return 'other';
    }

    const normalizedPath = normalize(pythonPath);
    if (normalizedPath.includes('conda')) return 'conda';

    const {stdout} = await execAsync(`"${pythonPath}" -c "import sys; print(sys.prefix)"`);
    const normalizedStdout = normalize(stdout);

    if (normalizedStdout.includes('conda')) return 'conda';

    const {stdout: versionStdout} = await execAsync(`"${pythonPath}" --version`);
    if (versionStdout.toLowerCase().includes('python')) {
      return 'official';
    }

    return 'other';
  } catch (error) {
    console.error(`Error detecting installation type for ${pythonPath}:`, error);
    return 'other';
  }
}

export async function parseVersion(pythonPath: string): Promise<{major: number; minor: number; patch: number}> {
  return new Promise(async (resolve, reject) => {
    try {
      const {stdout} = await execAsync(`"${pythonPath}" --version 2>&1`);
      const versionMatch = stdout.trim().match(/Python (\d+)\.(\d+)(?:\.(\d+))?/i);

      if (isNil(versionMatch)) {
        reject(new Error('Unable to parse version string'));
      }

      const [, major, minor, patch] = versionMatch!;
      resolve({
        major: Number(major),
        minor: Number(minor),
        patch: patch ? Number(patch) : 0,
      });
    } catch (error) {
      reject(new Error(`Failed to parse Python version: ${error}`));
    }
  });
}

export function findFileInDir(dirPath: string, fileName: string | undefined): string | null {
  if (!fileName) return null;
  const files = readdirSync(dirPath);

  for (const file of files) {
    const filePath = join(dirPath, file);
    const stats = statSync(filePath);

    if (stats.isDirectory()) {
      const result = findFileInDir(filePath, fileName);
      if (result) {
        return result;
      }
    } else if (stats.isFile() && file.toLowerCase().includes(fileName.toLowerCase())) {
      return filePath;
    }
  }

  return null;
}

export async function removeDir(dir: string): Promise<void> {
  try {
    const resolvedPath = resolve(dir);
    console.log(`Removing directory: ${resolvedPath}`);
    return await promises.rm(resolvedPath, {recursive: true, force: true});
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function getSitePackagesCount(pythonPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    exec(`"${pythonPath}" -m pip list --format=json --disable-pip-version-check`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      if (stderr) {
        reject(new Error(`Error from pip list: ${stderr}`));
        return;
      }

      try {
        const packages = JSON.parse(stdout);
        resolve(packages.length);
      } catch (parseError) {
        reject(new Error(`Could not parse pip list output: ${parseError}`));
      }
    });
  });
}

export async function openDialogExt(options: OpenDialogOptions): Promise<string | undefined> {
  try {
    const mainWindow = BrowserWindow.getFocusedWindow()!;
    const result: OpenDialogReturnValue = await (mainWindow
      ? dialog.showOpenDialog(mainWindow, options)
      : dialog.showOpenDialog(options));
    if (result.filePaths) return result.filePaths[0];
    return undefined;
  } catch (error) {
    console.log('util:openDialog -> No valid directory or file selected');
    throw error;
  }
}
