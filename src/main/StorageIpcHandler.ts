import {ipcMain} from 'electron';

import StorageManager from '../../../src/main/Managements/Storage/StorageManager';
import {CachedUsage, CustomTitle, pythonStorageChannels} from '../cross/CrossExtTypes';

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

  ipcMain.handle(pythonStorageChannels.getCachedUsage, (_, id: string) => {
    if (!storageManager) return 0;
    const usageList = storageManager.getCustomData(keys.cachedUsage) as CachedUsage[] | undefined;

    return usageList?.find(item => item.id === id)?.usage || 0;
  });

  ipcMain.on(pythonStorageChannels.clearCachedUsage, () => {
    if (!storageManager) return;
    storageManager.setCustomData(keys.cachedUsage, []);
  });

  ipcMain.on(pythonStorageChannels.setCachedUsage, (_, id: string, value: number) => {
    if (storageManager) {
      const usageList = storageManager.getCustomData(keys.cachedUsage) as CachedUsage[] | undefined;
      if (usageList) {
        const index = usageList.findIndex(item => item.id === id);
        if (index !== undefined && index !== -1) {
          usageList[index].usage = value;
        } else {
          usageList.push({id, usage: value});
        }
        storageManager.setCustomData(keys.cachedUsage, usageList);
      } else {
        storageManager.setCustomData(keys.cachedUsage, []);
      }
    }
  });

  ipcMain.handle(pythonStorageChannels.getVenvCustomTitle, () => {
    if (!storageManager) return [];

    return storageManager.getCustomData(keys.venvCustomTitle) || [];
  });

  ipcMain.on(pythonStorageChannels.setVenvCustomTitle, (_, data: CustomTitle[]) => {
    if (storageManager) {
      storageManager.setCustomData(keys.venvCustomTitle, data);
    }
  });
}
