import {exec} from 'node:child_process';
import {basename, join} from 'node:path';

import {existsSync} from 'graceful-fs';

import {VenvInfo} from '../../../../cross/CrossExtensions';

async function getPythonVersion(venvPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const pythonExecutable = join(venvPath, 'Scripts', 'python.exe');

    exec(`"${pythonExecutable}" --version`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      if (stderr) {
        // Python version might be printed to stderr (e.g., Python 2)
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

async function getSitePackagesCount(venvPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const pythonExecutable = join(venvPath, 'Scripts', 'python.exe'); // For Windows

    // Use pip list with the --format=json option
    exec(`"${pythonExecutable}" -m pip list --format=json`, (error, stdout, stderr) => {
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
        resolve(packages.length); // Number of packages
      } catch (parseError) {
        reject(new Error(`Could not parse pip list output: ${parseError}`));
      }
    });
  });
}

export async function getVenvInfo(venvPath: string): Promise<VenvInfo | null> {
  try {
    // 1. Get Python Version
    const pythonVersion = await getPythonVersion(venvPath);

    // 2. Get Number of Site Packages
    const sitePackagesCount = await getSitePackagesCount(venvPath);

    // 3. Get Folder Name
    const folderName = basename(venvPath);

    return {
      pythonVersion,
      sitePackagesCount,
      folderName,
      folder: venvPath,
    };
  } catch (error) {
    console.error(`Error getting venv information for ${venvPath}:`, error);
    return null;
  }
}

export function isVenvDirectory(dirPath: string): boolean {
  try {
    if (!existsSync(dirPath)) {
      return false;
    }

    const pythonExePath = join(dirPath, 'Scripts', 'python.exe');
    if (!existsSync(pythonExePath)) {
      return false; // Must have python.exe
    }

    const libPath = join(dirPath, 'Lib');
    if (!existsSync(libPath)) {
      return false; // Must have a Lib directory
    }

    return true;
  } catch (err) {
    console.error(`Error checking if directory is a venv: ${err}`);
    return false; // Assume not a venv on error
  }
}
