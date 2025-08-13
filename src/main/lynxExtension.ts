import {
  ExtensionMainApi,
  MainExtensionUtils,
} from '../../../src/main/Managements/Plugin/Extensions/ExtensionTypes_Main';
import StorageManager from '../../../src/main/Managements/Storage/StorageManager';
import {DefaultLynxPython_StorageID, MaxRetry_StorageID} from '../cross/CrossExtConstants';
import ListenForChannels from './ListenForChannels';
import {replacePythonPath} from './Utils/ExtMainUtils';

export let storageManager: StorageManager | undefined = undefined;
export let defaultEnvPath = process.env.PATH;

export const setDefaultEnvPath = (path: string) => {
  defaultEnvPath = path;
};

export async function initialExtension(lynxApi: ExtensionMainApi, utils: MainExtensionUtils) {
  utils.getStorageManager().then(storeManager => {
    storageManager = storeManager;

    if (!storeManager.getCustomData(MaxRetry_StorageID)) storeManager.setCustomData(MaxRetry_StorageID, 5);

    const defaultLynxPython = storeManager.getCustomData(DefaultLynxPython_StorageID);
    if (defaultLynxPython && defaultEnvPath) {
      const newPath = replacePythonPath(defaultEnvPath, defaultLynxPython);
      process.env.PATH = newPath;
    }
  });
  lynxApi.listenForChannels(() => ListenForChannels(storageManager, utils.nodePty));
}
