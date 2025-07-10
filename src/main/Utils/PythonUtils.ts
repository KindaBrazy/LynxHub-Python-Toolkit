import {spawn} from 'node:child_process';
import {join, resolve} from 'node:path';

import {exec} from 'child_process';
import {BrowserWindow, dialog, OpenDialogOptions, OpenDialogReturnValue} from 'electron';
import {existsSync, promises, readdirSync, statSync} from 'graceful-fs';
import {compare} from 'semver';

import {PythonInstallation} from '../../cross/CrossExtTypes';

export async function detectInstallationType(pythonPath: string): Promise<PythonInstallation['installationType']> {
  const normalize = (str: string) => str.toLowerCase();

  try {
    if (!existsSync(pythonPath)) {
      return 'other';
    }

    const normalizedPath = normalize(pythonPath);
    if (normalizedPath.includes('conda')) return 'conda';

    const prefixOutput = await spawnAsync(pythonPath, ['-c', 'import sys; print(sys.prefix)']);
    const normalizedPrefixOutput = normalize(prefixOutput);

    if (normalizedPrefixOutput.includes('conda')) return 'conda';

    const versionOutput = await spawnAsync(pythonPath, ['--version']);
    if (versionOutput.toLowerCase().includes('python')) {
      return 'official';
    }

    return 'other';
  } catch (error) {
    console.error(`Error detecting installation type for ${pythonPath}:`, error);
    return 'other';
  }
}

export async function parseVersion(pythonPath: string): Promise<{major: number; minor: number; patch: number}> {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn(pythonPath, ['--version']);

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', data => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', data => {
      stderr += data.toString();
    });

    pythonProcess.on('close', code => {
      if (code === 0) {
        const versionOutput = stdout.trim() || stderr.trim();

        const versionMatch = versionOutput.match(/Python (\d+)\.(\d+)(?:\.(\d+))?/i);

        if (!versionMatch) {
          reject(new Error('Unable to parse version string'));
        } else {
          const [, major, minor, patch] = versionMatch;
          resolve({
            major: Number(major),
            minor: Number(minor),
            patch: patch ? Number(patch) : 0,
          });
        }
      } else {
        reject(new Error(`Python process exited with code ${code}: ${stderr}`));
      }
    });
  });
}

export function findFileInDir(dirPath: string, fileName: string | undefined): string | null {
  try {
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
  } catch (e) {
    console.error(e);
    return null;
  }
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
  const version = await parseVersion(pythonPath);
  return new Promise((resolve, reject) => {
    const supportImportLib = compare(`${version.major}.${version.minor}.${version.patch}`, '3.8.0') === 1;
    const command = supportImportLib
      ? `import importlib.metadata; print(len(list(importlib.metadata.distributions())))`
      : `import pkg_resources; print(len(list(pkg_resources.working_set)))`;

    exec(`"${pythonPath}" -c "${command}"`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      if (stderr) {
        reject(new Error(`Python error: ${stderr}`));
        return;
      }

      try {
        const count = parseInt(stdout.trim(), 10);
        if (isNaN(count)) {
          throw new Error('Invalid count received');
        }
        resolve(count);
      } catch (parseError) {
        reject(new Error(`Could not parse package count: ${parseError}`));
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

function spawnAsync(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args);
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', data => {
      stdout += data.toString();
    });

    child.stderr.on('data', data => {
      stderr += data.toString();
    });

    child.on('close', code => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(stderr.trim()));
      }
    });

    child.on('error', err => {
      reject(err);
    });
  });
}
