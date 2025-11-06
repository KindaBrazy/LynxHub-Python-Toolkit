import {ipcMain} from 'electron';

import StorageManager from '../../../src/main/Managements/Storage/StorageManager';
import {pythonStorageChannels} from '../cross/CrossExtTypes';

const keys = {
  availableConda: 'availableConda',
  availableOfficial: 'availableOfficial',
  cachedUsage: 'cachedUsage',
  venvCustomTitle: 'venvCustomTitle',
};

export default function ListenForStorage(storageManager: StorageManager | undefined) {
  ipcMain.handle(pythonStorageChannels.getAvailableConda, () => {
    if (!storageManager) return [];

    return storageManager.getCustomData(keys.availableConda) || [];
  });

  ipcMain.on(pythonStorageChannels.setAvailableConda, (_, data: string[]) => {
    if (storageManager) {
      storageManager.setCustomData(keys.availableConda, data);
    }
  });

  ipcMain.handle(pythonStorageChannels.getAvailableOfficial, () => {
    if (!storageManager) return [];

    return storageManager.getCustomData(keys.availableOfficial) || [];
  });

  ipcMain.on(pythonStorageChannels.setAvailableOfficial, (_, data: string[]) => {
    if (storageManager) {
      storageManager.setCustomData(keys.availableOfficial, data);
    }
  });
}
