import {exec} from 'node:child_process';
import {platform} from 'node:os';
import {join} from 'node:path';

import {promises} from 'graceful-fs';
import {compact} from 'lodash';
import {resolve} from 'path';
import semver, {compare} from 'semver';

import {Associates_StorageID} from '../../../cross/CrossExtConstants';
import {AssociateItem, PackageInfo, SitePackages_Info} from '../../../cross/CrossExtTypes';
import {storageManager} from '../../lynxExtension';
import {getVenvPythonPath, isVenvDirectory} from '../VirtualEnv/VenvUtils';
import {getLatestPipPackageVersion} from './PipToolsManager';

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

export async function getSitePackagesUpdates(packages: PackageInfo[]): Promise<SitePackages_Info[]> {
  try {
    const getLatest = packages.map(async pkg => {
      try {
        const latestVersion = await getLatestPipPackageVersion(pkg.name);
        const currentVersion = semver.coerce(pkg.version)?.version;

        if (!latestVersion || !currentVersion || compare(currentVersion, latestVersion) !== -1) return null;

        return {name: pkg.name, version: latestVersion};
      } catch (e) {
        return null;
      }
    });

    return compact(await Promise.all(getLatest));
  } catch (e) {
    console.error(e);
    return [];
  }
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

function updateAIVenvStorage(data: AssociateItem) {
  const existingData = storageManager?.getCustomData(Associates_StorageID) as AssociateItem[] | undefined;

  const result = existingData ? existingData.map(item => (item.id === data.id ? data : item)) : [];

  if (!existingData || !existingData.some(item => item.id === data.id)) {
    result.push(data);
  }

  storageManager?.setCustomData(Associates_StorageID, result);
}

export async function findAIVenv(id: string, folder: string | undefined) {
  try {
    if (!folder) throw 'Provided folder is not correct.';
    const venvFolder = await findVenvFolder(folder);
    if (venvFolder) {
      const pythonExecutable = getVenvPythonPath(venvFolder);
      updateAIVenvStorage({id, dir: pythonExecutable, type: 'venv'});
      return pythonExecutable;
    }
    throw 'Venv folder not Found';
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export function getExePathAssociate(item: AssociateItem) {
  switch (item.type) {
    case 'venv':
      return resolve(getVenvPythonPath(item.dir));
    case 'python':
    default:
      return resolve(platform() === 'win32' ? join(item.dir, 'python.exe') : join(item.dir, 'bin', 'python'));
  }
}

export function getAssociates() {
  return storageManager?.getCustomData(Associates_StorageID) as AssociateItem[] | undefined;
}

export function addAssociate(data: AssociateItem) {
  updateAIVenvStorage(data);
}

export function removeAssociate(id: string) {
  const existingData = storageManager?.getCustomData(Associates_StorageID) as AssociateItem[] | undefined;

  if (existingData) {
    storageManager?.setCustomData(
      Associates_StorageID,
      existingData.filter(item => item.id !== id),
    );
  }
}

export function removeAssociatePath(pythonPath: string) {
  const existingData = storageManager?.getCustomData(Associates_StorageID) as AssociateItem[] | undefined;

  if (existingData) {
    storageManager?.setCustomData(
      Associates_StorageID,
      existingData.filter(item => item.dir !== pythonPath),
    );
  }
}
