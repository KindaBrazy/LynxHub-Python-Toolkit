import {exec, execFile} from 'node:child_process';
import {platform} from 'node:os';
import {basename, join} from 'node:path';
import {promisify} from 'node:util';

import {existsSync, promises} from 'graceful-fs';

import {VenvInfo} from '../../../cross/CrossExtTypes';
import {addAssociate} from '../AssociateManager';
import {getSitePackagesCount} from '../PythonUtils';
import {updateVenvStorage} from './CreateVenv';

const execFileAsync = promisify(execFile);

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

async function checkPipInstallation(exePath: string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      await execFileAsync(exePath, ['-m', 'pip', '--version']);
      resolve();
    } catch (e) {
      console.log('pip not found. Attempting to install pip...');

      const installPipCommand = `"${exePath}" -m ensurepip --default-pip`;

      exec(installPipCommand, (installError, _, installStderr) => {
        if (installError) {
          return reject(`Error installing pip: ${installError.message}`);
        }
        if (installStderr) {
          console.warn(`stderr during pip installation: ${installStderr}`);
        }

        console.log('pip installed successfully.');

        resolve();
      });
    }
  });
}

export async function getVenvInfo(venvPath: string): Promise<VenvInfo> {
  const pythonVersion = await getPythonVersion(venvPath);

  const pythonExecutable = getVenvPythonPath(venvPath);
  await checkPipInstallation(pythonExecutable);
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

    // Windows uses 'Lib', Unix uses 'lib'
    const libPath = platform() === 'win32' ? join(dirPath, 'Lib') : join(dirPath, 'lib');
    return existsSync(libPath);
  } catch (err) {
    console.error(`Error checking if directory is a venv: ${err}`);
    return false;
  }
}

function isVenvFolderName(folder: string) {
  return (
    folder === 'venv' ||
    folder === '.venv' ||
    folder === 'env' ||
    folder === '.env' ||
    folder.startsWith('venv-') ||
    folder.startsWith('.venv-') ||
    folder.endsWith('-venv') ||
    folder.endsWith('-env') ||
    folder.toLowerCase().includes('virtualenv') ||
    folder.toLowerCase().includes('virtualenvironment')
  );
}

async function findVenvFolder(dirPath: string): Promise<string | null> {
  try {
    const items = await promises.readdir(dirPath, {withFileTypes: true});

    for (const item of items) {
      if (item.isDirectory()) {
        const itemName = item.name;
        const fullPath = join(dirPath, itemName);
        if (isVenvFolderName(itemName) && isVenvDirectory(fullPath)) {
          return fullPath;
        }
      }
    }

    return null;
  } catch (error) {
    console.error(`Error searching for virtual environment in ${dirPath}:`, error);
    return null;
  }
}

// TODO: add try catch for all usage of this method
export async function findAIVenv(id: string, folder: string | undefined) {
  try {
    if (!folder) throw 'Provided folder is not correct.';
    const venvFolder = await findVenvFolder(folder);
    if (venvFolder) {
      const pythonExecutable = getVenvPythonPath(venvFolder);
      updateVenvStorage(venvFolder);
      addAssociate({id, dir: venvFolder, type: 'venv'});
      return pythonExecutable;
    }
    throw 'Venv folder not Found';
  } catch (e) {
    console.error(e);
    throw e;
  }
}
