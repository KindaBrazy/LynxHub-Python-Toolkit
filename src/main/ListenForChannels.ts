import {ipcMain} from 'electron';

import StorageManager from '../../../src/main/Managements/Storage/StorageManager';
import {
  CacheDirUsage_StorageID,
  DefaultLynxPython_StorageID,
  MaxRetry_StorageID,
  PkgDisplay_StorageID,
} from '../cross/CrossExtConstants';
import {
  IdPathType,
  PackageInfo,
  PkgDisplayType,
  pythonChannels,
  PythonVersion,
  SitePackages_Info,
  VenvCreateOptions,
} from '../cross/CrossExtTypes';
import {defaultEnvPath} from './lynxExtension';
import {checkAIVenvsEnabled} from './Utils/AIVenvs';
import {getAvailablePythonVersions} from './Utils/Available';
import {setDefaultPython} from './Utils/DefaultPython';
import detectPythonInstallations, {addSavedPython, removeSavedPython} from './Utils/Detector';
import {replacePythonPath} from './Utils/ExtMainUtils';
import {createCondaEnv, isCondaInstalled, listAvailablePythons} from './Utils/Installer/Installer_Conda';
import downloadPython from './Utils/Installer/Installer_Official';
import {
  addAIVenv,
  findAIVenv,
  getAIVenv,
  getAIVenvs,
  getSitePackagesInfo,
  getSitePackagesUpdates,
  installPythonPackage,
  locateAIVenv,
  removeAIVenv,
  removeAIVenvPath,
  uninstallPythonPackage,
  updateAllPythonPackages,
  updatePythonPackage,
} from './Utils/PackageManager/PackageManager';
import {changePythonPackageVersion} from './Utils/PackageManager/PackageManagerUtil';
import {checkPackageUpdates} from './Utils/PackageManager/PipToolsManager';
import {
  findValidRequirementsFiles,
  getReqPath,
  readRequirements,
  saveRequirements,
  setReqPath,
} from './Utils/Requirements/PythonRequirements';
import uninstallPython from './Utils/Uninstaller/Uninstaller';
import createPythonVenv, {getVenvs, locateVenv} from './Utils/VirtualEnv/CreateVenv';

export default function ListenForChannels(storageManager: StorageManager | undefined, nodePty: any) {
  ipcMain.on(pythonChannels.removeSavedPython, (_, pPath: string) => removeSavedPython(pPath));
  ipcMain.on(pythonChannels.addSavedPython, (_, pPath: string) => addSavedPython(pPath));

  ipcMain.handle(
    pythonChannels.changePythonVersion,
    (_, pythonPath: string, packageName: string, currentVersion: string, targetVersion: string) =>
      changePythonPackageVersion(pythonPath, packageName, currentVersion, targetVersion),
  );

  ipcMain.handle(pythonChannels.getInstalledPythons, (_, refresh: boolean) => detectPythonInstallations(refresh));
  ipcMain.handle(pythonChannels.uninstallPython, (_, path: string) => uninstallPython(path, nodePty));
  ipcMain.handle(pythonChannels.setDefaultPython, (_, pythonPath: string) => setDefaultPython(pythonPath));

  ipcMain.handle(pythonChannels.getAvailableOfficial, () => getAvailablePythonVersions());
  ipcMain.handle(pythonChannels.installOfficial, (_, version: PythonVersion) => downloadPython(version));

  ipcMain.handle(pythonChannels.getAvailableConda, () => listAvailablePythons(nodePty));
  ipcMain.handle(pythonChannels.installConda, (_, envName: string, version: string) =>
    createCondaEnv(envName, version, nodePty),
  );
  ipcMain.handle(pythonChannels.isCondaInstalled, () => isCondaInstalled(nodePty));

  ipcMain.handle(pythonChannels.createVenv, (_, options: VenvCreateOptions) => createPythonVenv(options));
  ipcMain.handle(pythonChannels.getVenvs, () => getVenvs());
  ipcMain.handle(pythonChannels.locateVenv, () => locateVenv());

  ipcMain.handle(pythonChannels.getPackagesInfo, (_, pythonPath: string) => getSitePackagesInfo(pythonPath));
  ipcMain.handle(pythonChannels.uninstallPackage, (_, pythonPath: string, packageName: string) =>
    uninstallPythonPackage(pythonPath, packageName),
  );
  ipcMain.handle(pythonChannels.installPackage, (_, pythonPath: string, command: string) =>
    installPythonPackage(pythonPath, command),
  );

  ipcMain.handle(pythonChannels.getPackagesUpdateInfo, (_, packages: PackageInfo[]) =>
    getSitePackagesUpdates(packages),
  );

  ipcMain.handle(pythonChannels.updatePackage, (_, pythonPath: string, packageName: string) =>
    updatePythonPackage(pythonPath, packageName),
  );
  ipcMain.handle(pythonChannels.updateAllPackages, (_, pythonPath: string, packages: string[]) =>
    updateAllPythonPackages(pythonPath, packages),
  );

  ipcMain.handle(pythonChannels.readReqs, (_, filePath: string) => readRequirements(filePath));
  ipcMain.handle(pythonChannels.saveReqs, (_, filePath: string, data) => saveRequirements(filePath, data));
  ipcMain.handle(pythonChannels.findReq, (_, dirPath: string) => findValidRequirementsFiles(dirPath));

  ipcMain.on(pythonChannels.setReqPath, (_, data: IdPathType) => setReqPath(data));
  ipcMain.handle(pythonChannels.getReqPath, (_, id: string) => getReqPath(id));

  ipcMain.handle(pythonChannels.locateAIVenv, (_, id: string) => locateAIVenv(id));
  ipcMain.handle(pythonChannels.getAIVenv, (_, id: string) => getAIVenv(id));
  ipcMain.on(pythonChannels.addAIVenv, (_, id: string, pythonPath: string) => addAIVenv(id, pythonPath));
  ipcMain.on(pythonChannels.removeAIVenv, (_, id: string) => removeAIVenv(id));
  ipcMain.on(pythonChannels.removeAIVenvPath, (_, path: string) => removeAIVenvPath(path));
  ipcMain.handle(pythonChannels.getAIVenvs, () => getAIVenvs());
  ipcMain.handle(pythonChannels.findAIVenv, (_, id: string, folder: string | undefined) => findAIVenv(id, folder));
  ipcMain.on(pythonChannels.checkAIVenvEnabled, () => checkAIVenvsEnabled());

  ipcMain.handle(pythonChannels.getUpdatesReq, (_, reqFile: string, currentPackages: SitePackages_Info[]) =>
    checkPackageUpdates(reqFile, currentPackages),
  );

  ipcMain.handle(pythonChannels.getMaxRetry, () => {
    const result = storageManager?.getCustomData(MaxRetry_StorageID);

    if (!result) {
      storageManager?.setCustomData(MaxRetry_StorageID, 5);
      return 5;
    }

    return result;
  });
  ipcMain.on(pythonChannels.setMaxRetry, (_, value: number) => {
    storageManager?.setCustomData(MaxRetry_StorageID, value);
  });

  ipcMain.handle(pythonChannels.getPkgDisplay, () => {
    const result = storageManager?.getCustomData(PkgDisplay_StorageID);

    if (!result) {
      storageManager?.setCustomData(PkgDisplay_StorageID, 'default');
      return 'default';
    }

    return result;
  });
  ipcMain.on(pythonChannels.setPkgDisplay, (_, value: PkgDisplayType) => {
    storageManager?.setCustomData(PkgDisplay_StorageID, value);
  });

  ipcMain.handle(pythonChannels.getCacheStorageUsage, () => {
    const result = storageManager?.getCustomData(CacheDirUsage_StorageID);

    if (!result) {
      storageManager?.setCustomData(CacheDirUsage_StorageID, true);
      return true;
    }

    return result;
  });
  ipcMain.on(pythonChannels.setCacheStorageUsage, (_, value: boolean) => {
    storageManager?.setCustomData(CacheDirUsage_StorageID, value);
  });

  ipcMain.handle(pythonChannels.replacePythonPath, (_, pythonPath: string) => {
    try {
      if (!defaultEnvPath) return false;

      const newPath = replacePythonPath(defaultEnvPath, pythonPath);
      storageManager?.setCustomData(DefaultLynxPython_StorageID, pythonPath);

      process.env.PATH = newPath;
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  });
}
