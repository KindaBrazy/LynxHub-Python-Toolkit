import {ExtensionMainApi, MainExtensionUtils} from '../../../src/main/plugins/extensions/types';
import {
  AI_VENV_STORE_KEYS,
  Associates_StorageID,
  DefaultLynxPython_StorageID,
  IsAutoDetectedVenvs_StorageID,
  MaxRetry_StorageID,
  SENTRY_DSN,
} from '../cross/CrossExtConstants';
import {AssociateItem, IdPathType} from '../cross/CrossExtTypes';
import {getDefaultEnvPath, setAppManager, setNodePty, setStorage} from './DataHolder';
import ListenForChannels from './ListenForChannels';
import {replacePythonPath} from './Utils/ExtMainUtils';
import {findAIVenv} from './Utils/VirtualEnv/VenvUtils';

export async function initialExtension(lynxApi: ExtensionMainApi, utils: MainExtensionUtils) {
  lynxApi.initNodeSentry(SENTRY_DSN);

  utils.getAppManager().then(app => {
    setAppManager(app);
  });
  setNodePty(utils.nodePty);

  utils.getStorageManager().then(storeManager => {
    setStorage(storeManager);

    if (!storeManager.getCustomData(MaxRetry_StorageID)) storeManager.setCustomData(MaxRetry_StorageID, 5);

    const defaultLynxPython = storeManager.getCustomData(DefaultLynxPython_StorageID);
    const defaultEnvPath = getDefaultEnvPath();

    if (defaultLynxPython && defaultEnvPath) {
      process.env.PATH = replacePythonPath(defaultEnvPath, defaultLynxPython);
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
        findAIVenv(card.id, card.dir).catch(err => {
          console.error(`Error auto-detecting venv for card ${card.id}:`, err);
        });
      });
      storeManager.setCustomData(IsAutoDetectedVenvs_StorageID, true);
    }
  });
  lynxApi.listenForChannels(() => ListenForChannels(utils.nodePty));
}
