import type ElectronAppManager from '../../../src/main/Managements/ElectronAppManager';
import type StorageManager from '../../../src/main/Managements/Storage/StorageManager';

let storageManager: StorageManager | undefined = undefined;
let appManager: ElectronAppManager | undefined = undefined;
let defaultEnvPath = process.env.PATH;

export const setStorage = (storage: StorageManager) => (storageManager = storage);
export const getStorage = () => storageManager;

export const setAppManager = (manager: ElectronAppManager) => (appManager = manager);
export const getAppManager = () => appManager;

export const setDefaultEnvPath = (path: string) => (defaultEnvPath = path);
export const getDefaultEnvPath = () => defaultEnvPath;
