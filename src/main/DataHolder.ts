import type Pty from 'node-pty';

import type ElectronAppManager from '../../../src/main/mainWindow';
import type StorageManager from '../../../src/main/storage/helper';
import {DefaultLynxPython_StorageID} from '../cross/CrossExtConstants';

let storageManager: StorageManager | undefined = undefined;
let appManager: ElectronAppManager | undefined = undefined;
let defaultEnvPath = process.env.PATH;
let nodePty: typeof Pty | undefined = undefined;

// Storage key for system default Python (the one set via "Set as System Default")
const SystemDefaultPython_StorageID = 'pythonToolkit_SystemDefaultPython';

export const setStorage = (storage: StorageManager) => (storageManager = storage);
export const getStorage = () => storageManager;

export const setAppManager = (manager: ElectronAppManager) => (appManager = manager);
export const getAppManager = () => appManager;

export const setDefaultEnvPath = (path: string) => (defaultEnvPath = path);
export const getDefaultEnvPath = () => defaultEnvPath;

export const setNodePty = (pty: typeof Pty) => (nodePty = pty);
export const getNodePty = () => nodePty;

// System default Python storage (the one user explicitly set via "Set as System Default")
export const getStoredSystemDefaultPython = (): string | undefined => {
  return storageManager?.getCustomData(SystemDefaultPython_StorageID);
};

export const setStoredSystemDefaultPython = (pythonPath: string) => {
  storageManager?.setCustomData(SystemDefaultPython_StorageID, pythonPath);
};

// LynxHub default Python storage (uses existing storage key for backward compatibility)
export const getStoredLynxHubDefaultPython = (): string | undefined => {
  return storageManager?.getCustomData(DefaultLynxPython_StorageID);
};

export const setStoredLynxHubDefaultPython = (pythonPath: string) => {
  storageManager?.setCustomData(DefaultLynxPython_StorageID, pythonPath);
};
