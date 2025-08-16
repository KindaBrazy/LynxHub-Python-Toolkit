import {platform} from 'node:os';
import {join, resolve} from 'node:path';

import {isString} from 'lodash';

import {Associates_StorageID} from '../../cross/CrossExtConstants';
import {AssociateItem} from '../../cross/CrossExtTypes';
import {storageManager} from '../lynxExtension';
import {getVenvPythonPath} from './VirtualEnv/VenvUtils';

/**
 * Generate environment activation or path modification command
 */
function getCommandByType(type: 'python' | 'venv' | 'conda', dir: string, condaName?: string): string {
  const isWin = platform() === 'win32';

  switch (type) {
    case 'python':
      return isWin ? `$env:Path = "${dir};${dir}\\Scripts" + $env:Path` : `export PATH="${dir}:${dir}/bin:$PATH"`;
    case 'venv':
      return isWin ? `${dir}\\Scripts\\activate.ps1` : `source ${dir}/bin/activate`;
    case 'conda':
      return `conda activate ${condaName || `--prefix "${dir}"`}`;
    default:
      throw new Error(`Unsupported environment type: ${type}`);
  }
}

/**
 * Remove terminal pre-commands for given associate ID
 */
function removePreCommands(id: string): void {
  try {
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
    return storageManager?.getCustomData(Associates_StorageID) as AssociateItem[] | undefined;
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
      switch (item.type) {
        case 'venv':
          return resolve(getVenvPythonPath(item.dir));
        case 'python':
        case 'conda':
        default:
          return resolve(platform() === 'win32' ? join(item.dir, 'python.exe') : join(item.dir, 'bin', 'python'));
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
