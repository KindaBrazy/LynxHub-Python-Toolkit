import {
  ExtensionMainApi,
  MainExtensionUtils,
} from '../../../src/main/Managements/Plugin/Extensions/ExtensionTypes_Main';
import StorageManager from '../../../src/main/Managements/Storage/StorageManager';
import {MaxRetry_StorageID} from '../cross/CrossExtConstants';
import ListenForChannels from './ListenForChannels';

export let storageManager: StorageManager | undefined = undefined;

export async function initialExtension(lynxApi: ExtensionMainApi, utils: MainExtensionUtils) {
  utils.getStorageManager().then(storeManager => {
    storageManager = storeManager;
    if (!storeManager.getCustomData(MaxRetry_StorageID)) storeManager.setCustomData(MaxRetry_StorageID, 5);
  });
  lynxApi.listenForChannels(() => ListenForChannels(storageManager, utils.nodePty));
}
