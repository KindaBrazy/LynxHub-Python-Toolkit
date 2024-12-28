import {exec} from 'node:child_process';
import {join} from 'node:path';

import {promises} from 'graceful-fs';

import {IdPathType, SitePackages_Info} from '../../../../cross/extension/CrossExtTypes';
import {storageManager} from '../../lynxExtension';
import {openDialogExt} from '../PythonUtils';
import {isVenvDirectory} from '../VirtualEnv/VenvUtils';

const AI_VENV_STORE_KEYS = 'ai_venvs';

export async function getSitePackagesInfo(pythonExePath: string): Promise<SitePackages_Info[]> {
  return new Promise((resolve, reject) => {
    const command = `"${pythonExePath}" -m pip list --format json`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error getting site packages: ${error.message}`);
        return;
      }
      if (stderr) {
        console.warn(`stderr when getting site packages: ${stderr}`);
      }

      try {
        const packages: {name: string; version: string}[] = JSON.parse(stdout);
        const packagePromises: SitePackages_Info[] = packages.map(pkg => {
          return {name: pkg.name, version: pkg.version};
        });

        resolve(packagePromises);
      } catch (parseError) {
        reject(`Error parsing pip output: ${parseError}`);
      }
    });
  });
}

export async function getSitePackagesUpdates(pythonExePath: string): Promise<SitePackages_Info[]> {
  return new Promise((resolve, reject) => {
    const command = `"${pythonExePath}" -m pip list --format json --outdated`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error getting site packages: ${error.message}`);
        return;
      }
      if (stderr) {
        console.warn(`stderr when getting site packages: ${stderr}`);
      }

      try {
        const packages: {name: string; version: string; latest_version: string}[] = JSON.parse(stdout);
        const packagePromises: SitePackages_Info[] = packages.map(pkg => {
          return {name: pkg.name, version: pkg.latest_version};
        });

        resolve(packagePromises);
      } catch (parseError) {
        reject(`Error parsing pip output: ${parseError}`);
      }
    });
  });
}

export async function installPythonPackage(pythonExePath: string, commands: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const command = `${pythonExePath} -m pip install ${commands} --disable-pip-version-check`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Error installing package: ${error.message}\nStderr: ${stderr}`));
        return;
      }

      if (stderr) {
        console.warn(`pip stderr: ${stderr}`);
      }

      resolve(stdout);
    });
  });
}

export async function updatePythonPackage(pythonExePath: string, packageName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const command = `"${pythonExePath}" -m pip install --upgrade "${packageName}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error updating package ${packageName}: ${error.message}\nstderr: ${stderr}`);
        return;
      }

      resolve(stdout);
    });
  });
}

export async function updateAllPythonPackages(pythonExePath: string, packages: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    if (packages.length === 0) {
      resolve('All packages are up to date.');
      return;
    }

    const updateCommand = `"${pythonExePath}" -m pip install --upgrade ${packages.join(' ')}`;

    exec(updateCommand, (updateError, updateStdout, updateStderr) => {
      if (updateError) {
        reject(`Error updating packages: ${updateError.message}\nstderr: ${updateStderr}`);
        return;
      }

      resolve(updateStdout);
    });
  });
}

export async function uninstallPythonPackage(pythonExePath: string, packageName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const command = `"${pythonExePath}" -m pip uninstall -y "${packageName}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error uninstalling package ${packageName}: ${error.message}\nstderr: ${stderr}`);
        return;
      }

      resolve(stdout);
    });
  });
}

export async function locateAIVenv(id: string) {
  try {
    const selectedFolder = await openDialogExt({properties: ['openDirectory']});

    if (!selectedFolder) {
      throw 'Folder not selected.';
    }
    const isVenv = isVenvDirectory(selectedFolder);

    if (isVenv) {
      const pythonExecutable = join(selectedFolder, 'Scripts', 'python.exe');
      updateAIVenvStorage({id, path: pythonExecutable});
      return pythonExecutable;
    }

    throw 'Selected folder is not venv.';
  } catch (e) {
    console.error(e);
    throw e;
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
  console.log('dirPath', dirPath);
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

function updateAIVenvStorage(data: IdPathType) {
  const existingData = storageManager?.getCustomData(AI_VENV_STORE_KEYS) as IdPathType[] | undefined;

  const result = existingData ? existingData.map(item => (item.id === data.id ? data : item)) : [];

  if (!existingData || !existingData.some(item => item.id === data.id)) {
    result.push(data);
  }

  storageManager?.setCustomData(AI_VENV_STORE_KEYS, result);
}

export async function findAIVenv(id: string, folder: string | undefined) {
  try {
    if (!folder) throw 'Provided folder is not correct.';
    const venvFolder = await findVenvFolder(folder);
    if (venvFolder) {
      const pythonExecutable = join(venvFolder, 'Scripts', 'python.exe');
      updateAIVenvStorage({id, path: pythonExecutable});
      return pythonExecutable;
    }
    throw 'Venv folder not Found';
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export function getAIVenv(id: string) {
  const data = storageManager?.getCustomData(AI_VENV_STORE_KEYS) as IdPathType[] | undefined;
  return data?.find(item => item.id === id)?.path;
}

export function getAIVenvs() {
  return storageManager?.getCustomData(AI_VENV_STORE_KEYS) as IdPathType[] | undefined;
}

export function addAIVenv(id: string, pythonPath: string) {
  updateAIVenvStorage({id, path: pythonPath});
}

export function removeAIVenv(id: string) {
  const existingData = storageManager?.getCustomData(AI_VENV_STORE_KEYS) as IdPathType[] | undefined;

  if (existingData) {
    storageManager?.setCustomData(
      AI_VENV_STORE_KEYS,
      existingData.filter(item => item.id !== id),
    );
  }
}

export function removeAIVenvPath(pythonPath: string) {
  const existingData = storageManager?.getCustomData(AI_VENV_STORE_KEYS) as IdPathType[] | undefined;

  if (existingData) {
    storageManager?.setCustomData(
      AI_VENV_STORE_KEYS,
      existingData.filter(item => item.path !== pythonPath),
    );
  }
}
