import {platform} from 'node:os';
import {join, resolve} from 'node:path';

import {isString} from 'lodash';

import {Associates_StorageID} from '../../cross/CrossExtConstants';
import {AssociateItem} from '../../cross/CrossExtTypes';
import {getStorage} from '../DataHolder';
import {getVenvPythonPath} from './VirtualEnv/VenvUtils';

/**
 * Generate environment activation or path modification command
 */
function getCommandByType(type: 'python' | 'venv' | 'conda', dir: string, condaName?: string): string {
  const isWin = platform() === 'win32';

  switch (type) {
    case 'python': {
      if (isWin) {
        // On Windows, dir is the base folder (e.g., C:\Python312), Scripts is a subdirectory
        return `$env:Path = "${dir};${dir}\\Scripts;" + $env:Path`;
      }
      // On Unix, dir is already the bin folder (e.g., /usr/local/bin), just add it to PATH
      return `export PATH="${dir}:$PATH"`;
    }
    case 'venv': {
      if (isWin) {
        return `& "${dir}\\Scripts\\Activate.ps1"`;
      }
      // On Unix, check if dir already ends with /bin to avoid /bin/bin/activate
      const activatePath = dir.endsWith('/bin') ? `${dir}/activate` : `${dir}/bin/activate`;
      return `source "${activatePath}"`;
    }
    case 'conda': {
      if (isWin) {
        // On Windows, use conda activate with the environment name or path
        if (condaName) {
          return `conda activate ${condaName}`;
        }
        // For base conda or when no name is provided, activate using the path
        return `conda activate "${dir}"`;
      }
      // On Unix
      if (condaName) {
        return `conda activate ${condaName}`;
      }
      // On Unix, dir is the bin folder, we need the parent for conda activate
      const condaPath = dir.endsWith('/bin') ? dir.slice(0, -4) : dir;
      return `source "${condaPath}/bin/activate"`;
    }
    default:
      throw new Error(`Unsupported environment type: ${type}`);
  }
}

/**
 * Remove terminal pre-commands for given associate ID
 */
function removePreCommands(id: string): void {
  try {
    const storageManager = getStorage();
    if (!storageManager) return;

    const prevCommands = storageManager.getData('cards')?.cardTerminalPreCommands;
    if (!prevCommands) return;

    storageManager.updateData('cards', {
      cardTerminalPreCommands: prevCommands.filter(item => item.id !== id),
    });
  } catch (err) {
    console.warn(`Failed to remove pre-commands for ID: ${id}`, err);
  }
}

/**
 * Retrieve all associates from storage
 */
export function getAssociates(): AssociateItem[] | undefined {
  try {
    return getStorage()?.getCustomData(Associates_StorageID) as AssociateItem[] | undefined;
  } catch (err) {
    console.warn('Failed to get associates:', err);
    return undefined;
  }
}

/**
 * Insert or update associate in storage
 */
function updateAssociateStorage(data: AssociateItem): void {
  try {
    const storageManager = getStorage();
    if (!storageManager) return;

    const existingData = getAssociates() || [];
    const exists = existingData.some(item => item.id === data.id);

    const updated = exists ? existingData.map(item => (item.id === data.id ? data : item)) : [...existingData, data];

    storageManager.setCustomData(Associates_StorageID, updated);
  } catch (err) {
    console.error('Failed to update associate storage:', err);
  }
}

/**
 * Get Python executable path for associate item or ID
 */
export function getExePathAssociate(target: AssociateItem | string): string | undefined {
  try {
    const buildPath = (item: AssociateItem) => {
      const isWin = platform() === 'win32';

      switch (item.type) {
        case 'venv':
          return resolve(getVenvPythonPath(item.dir));
        case 'conda': {
          // Conda python.exe is in the base folder on Windows, bin folder on Unix
          if (isWin) {
            return resolve(join(item.dir, 'python.exe'));
          }
          // On Unix, dir is the bin folder
          const pythonPath = item.dir.endsWith('/bin') ? join(item.dir, 'python') : join(item.dir, 'bin', 'python');
          return resolve(pythonPath);
        }
        case 'python':
        default: {
          // Official Python: on Windows dir is base folder, on Unix dir is bin folder
          if (isWin) {
            return resolve(join(item.dir, 'python.exe'));
          }
          // On Unix, check if dir ends with /bin
          const pythonPath = item.dir.endsWith('/bin') ? join(item.dir, 'python') : join(item.dir, 'bin', 'python');
          return resolve(pythonPath);
        }
      }
    };

    if (isString(target)) {
      const associate = getAssociates()?.find(value => value.id === target);
      return associate ? buildPath(associate) : undefined;
    }

    return buildPath(target);
  } catch (err) {
    console.warn('Failed to get executable path for associate:', err);
    return undefined;
  }
}

/**
 * Add associate and notify UI
 */
export function addAssociate(data: AssociateItem): void {
  try {
    updateAssociateStorage(data);

    const storageManager = getStorage();
    if (storageManager) {
      storageManager.setCardTerminalPreCommands(data.id, [getCommandByType(data.type, data.dir, data.condaName)]);
    }
  } catch (err) {
    console.error('Error adding associate:', err);
  }
}

/**
 * Remove associate by ID
 */
export function removeAssociate(id: string): void {
  try {
    const existingData = getAssociates();
    const storageManager = getStorage();
    if (!existingData || !storageManager) return;

    storageManager.setCustomData(
      Associates_StorageID,
      existingData.filter(item => item.id !== id),
    );

    removePreCommands(id);
  } catch (err) {
    console.error(`Error removing associate with ID: ${id}`, err);
  }
}

/**
 * Remove associate by Python path
 */
export function removeAssociatePath(pythonPath: string): void {
  try {
    const existingData = getAssociates();
    const targetID = existingData?.find(item => item.dir === pythonPath)?.id;

    const storageManager = getStorage();
    if (!existingData || !targetID || !storageManager) return;

    storageManager.setCustomData(
      Associates_StorageID,
      existingData.filter(item => item.id !== targetID),
    );

    removePreCommands(targetID);
  } catch (err) {
    console.warn(`Error removing associate by path: ${pythonPath}`, err);
  }
}
