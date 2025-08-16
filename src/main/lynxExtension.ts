import ElectronAppManager from '../../../src/main/Managements/ElectronAppManager';
import {
  ExtensionMainApi,
  MainExtensionUtils,
} from '../../../src/main/Managements/Plugin/Extensions/ExtensionTypes_Main';
import StorageManager from '../../../src/main/Managements/Storage/StorageManager';
import {
  AI_VENV_STORE_KEYS,
  Associates_StorageID,
  DefaultLynxPython_StorageID,
  IsAutoDetectedVenvs_StorageID,
  MaxRetry_StorageID,
} from '../cross/CrossExtConstants';
import {AssociateItem, IdPathType} from '../cross/CrossExtTypes';
import ListenForChannels from './ListenForChannels';
import {replacePythonPath} from './Utils/ExtMainUtils';
import {findAIVenv} from './Utils/VirtualEnv/VenvUtils';

export let storageManager: StorageManager | undefined = undefined;
export let appManager: ElectronAppManager | undefined = undefined;
export let defaultEnvPath = process.env.PATH;

export const setDefaultEnvPath = (path: string) => {
  defaultEnvPath = path;
};

export async function initialExtension(lynxApi: ExtensionMainApi, utils: MainExtensionUtils) {
  utils.getAppManager().then(app => {
    appManager = app;
  });
  utils.getStorageManager().then(storeManager => {
    storageManager = storeManager;

    if (!storeManager.getCustomData(MaxRetry_StorageID)) storeManager.setCustomData(MaxRetry_StorageID, 5);

    const defaultLynxPython = storeManager.getCustomData(DefaultLynxPython_StorageID);
    if (defaultLynxPython && defaultEnvPath) {
      const newPath = replacePythonPath(defaultEnvPath, defaultLynxPython);
      process.env.PATH = newPath;
    }

    const associates = storeManager.getCustomData(Associates_StorageID);
    if (!associates) {
      const oldAssociates = storeManager.getCustomData(AI_VENV_STORE_KEYS) as IdPathType[] | undefined;
      if (oldAssociates) {
        const newAssociates: AssociateItem[] = oldAssociates.map(item => ({id: item.id, dir: item.path, type: 'venv'}));
        storeManager.setCustomData(Associates_StorageID, newAssociates);
        storeManager.setCustomData(AI_VENV_STORE_KEYS, undefined);
      }
    }

    if (!storeManager.getCustomData(IsAutoDetectedVenvs_StorageID)) {
      storeManager.getData('cards').installedCards.forEach(card => {
        findAIVenv(card.id, card.dir);
      });
      storeManager.setCustomData(IsAutoDetectedVenvs_StorageID, true);
    }
  });
  lynxApi.listenForChannels(() => ListenForChannels(storageManager, utils.nodePty));
}
