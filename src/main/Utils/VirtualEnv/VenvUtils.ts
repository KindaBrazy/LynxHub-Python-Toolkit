import {exec} from 'node:child_process';
import {platform} from 'node:os';
import {basename, join} from 'node:path';

import {existsSync} from 'graceful-fs';

import {VenvInfo} from '../../../cross/CrossExtTypes';
import {getSitePackagesCount} from '../PythonUtils';

async function getPythonVersion(venvPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const pythonExecutable = getVenvPythonPath(venvPath);

    exec(`"${pythonExecutable}" --version`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      if (stderr) {
        const versionMatch = stderr.match(/Python (\d+\.\d+(\.\d+)?)/);
        if (versionMatch) {
          resolve(versionMatch[1]);
          return;
        }
        reject(new Error(`Could not parse Python version from stderr: ${stderr}`));
      }
      const versionMatch = stdout.match(/Python (\d+\.\d+(\.\d+)?)/);
      if (versionMatch) {
        resolve(versionMatch[1]);
      } else {
        reject(new Error(`Could not parse Python version from stdout: ${stdout}`));
      }
    });
  });
}

export async function getVenvInfo(venvPath: string): Promise<VenvInfo> {
  const pythonVersion = await getPythonVersion(venvPath);

  const pythonExecutable = getVenvPythonPath(venvPath);
  const sitePackagesCount = await getSitePackagesCount(pythonExecutable);

  const folderName = basename(venvPath);

  return {
    pythonVersion,
    pythonPath: pythonExecutable,
    sitePackagesCount,
    name: folderName,
    folder: venvPath,
  };
}

export function getVenvPythonPath(venvPath: string): string {
  return platform() === 'win32' ? join(venvPath, 'Scripts', 'python.exe') : join(venvPath, 'bin', 'python');
}

export function isVenvDirectory(dirPath: string): boolean {
  try {
    if (!existsSync(dirPath)) {
      return false;
    }

    const pythonExePath = getVenvPythonPath(dirPath);
    if (!existsSync(pythonExePath)) {
      return false;
    }

    const libPath = join(dirPath, 'lib');
    return existsSync(libPath);
  } catch (err) {
    console.error(`Error checking if directory is a venv: ${err}`);
    return false;
  }
}
