import {join, resolve} from 'node:path';

import {exec} from 'child_process';
import {existsSync, promises, readdirSync, statSync} from 'graceful-fs';
import {isNil} from 'lodash';
import {promisify} from 'util';

import {PythonInstallation} from '../../../cross/CrossExtensions';

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
