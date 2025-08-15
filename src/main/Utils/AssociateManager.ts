import {platform} from 'node:os';
import {join, resolve} from 'node:path';

import {BrowserWindow} from 'electron';

import {Associates_StorageID} from '../../cross/CrossExtConstants';
import {AssociateItem, pythonChannels} from '../../cross/CrossExtTypes';
import {storageManager} from '../lynxExtension';
import {getVenvPythonPath} from './VirtualEnv/VenvUtils';

function updateAssociateStorage(data: AssociateItem) {
  const existingData = storageManager?.getCustomData(Associates_StorageID) as AssociateItem[] | undefined;

  const result = existingData ? existingData.map(item => (item.id === data.id ? data : item)) : [];

  if (!existingData || !existingData.some(item => item.id === data.id)) {
    result.push(data);
  }

  storageManager?.setCustomData(Associates_StorageID, result);
}

export function getExePathAssociate(item: AssociateItem) {
  switch (item.type) {
    case 'venv':
      return resolve(getVenvPythonPath(item.dir));
    case 'python':
    case 'conda':
    default:
      return resolve(platform() === 'win32' ? join(item.dir, 'python.exe') : join(item.dir, 'bin', 'python'));
  }
}

export function getAssociates() {
  return storageManager?.getCustomData(Associates_StorageID) as AssociateItem[] | undefined;
}

export function addAssociate(data: AssociateItem) {
  try {
    updateAssociateStorage(data);
    BrowserWindow.getFocusedWindow()?.webContents.send(pythonChannels.onAssociateChange, data, 'add');
  } catch (e) {
    console.log(e);
  }
}

export function removeAssociate(id: string) {
  const existingData = storageManager?.getCustomData(Associates_StorageID) as AssociateItem[] | undefined;

  if (existingData) {
    storageManager?.setCustomData(
      Associates_StorageID,
      existingData.filter(item => item.id !== id),
    );
    BrowserWindow.getFocusedWindow()?.webContents.send(pythonChannels.onAssociateChange, id, 'remove');
  }
}

export function removeAssociatePath(pythonPath: string) {
  try {
    const existingData = storageManager?.getCustomData(Associates_StorageID) as AssociateItem[] | undefined;
    const targetID = existingData?.find(item => item.dir === pythonPath)?.id;

    if (existingData && targetID) {
      storageManager?.setCustomData(
        Associates_StorageID,
        existingData.filter(item => item.id !== targetID),
      );
      BrowserWindow.getFocusedWindow()?.webContents.send(pythonChannels.onAssociateChange, targetID, 'remove');
    }
  } catch (e) {
    console.warn(e);
  }
}
