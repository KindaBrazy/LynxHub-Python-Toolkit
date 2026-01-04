import {app, ipcMain} from 'electron';

import {OnPreCommands} from '../../../src/cross/IpcChannelAndTypes';
import {
  CacheDirUsage_StorageID,
  CardStartCommand_StorageID,
  DefaultLynxPython_StorageID,
  MaxConcurrent_StorageID,
  MaxRetry_StorageID,
  PkgDisplay_StorageID,
} from '../cross/CrossExtConstants';
import {
  AssociateItem,
  IdPathType,
  PackageInfo,
  PackageUpdate,
  PkgDisplayType,
  pythonChannels,
  PythonVersion,
  SitePackages_Info,
  VenvCreateOptions,
} from '../cross/CrossExtTypes';
import {getDefaultEnvPath, getStorage} from './DataHolder';
import ListenForStorage from './StorageIpcHandler';
import {
  addAssociate,
  getAssociates,
  getExePathAssociate,
  removeAssociate,
  removeAssociatePath,
} from './Utils/AssociateManager';
import {getAvailablePythonVersions} from './Utils/Available';
import {setDefaultPython} from './Utils/DefaultPython';
import detectPythonInstallations, {addSavedPython, locatePythonInstallation, removeSavedPython} from './Utils/Detector';
import {replacePythonPath} from './Utils/ExtMainUtils';
import {createCondaEnv, isCondaInstalled, listAvailablePythons} from './Utils/Installer/Installer_Conda';
import downloadPython from './Utils/Installer/Installer_Official';
import {getSitePackagesInfo, installPythonPackage, uninstallPythonPackage} from './Utils/PackageManager/PackageManager';
import {changePythonPackageVersion} from './Utils/PackageManager/PackageManagerUtil';
import {
  cancelPackagesUpdateCheck,
  getPackagesUpdate,
  getPackagesUpdateByReq,
  getPipPackageAllVersions,
} from './Utils/PackageManager/PipToolsManager';
import {abortOngoingUpdate, updatePackages, updatePythonPackage} from './Utils/PackageManager/Updater';
import {parseVersion} from './Utils/PythonUtils';
import {
  findValidRequirementsFiles,
  getReqPath,
  readRequirements,
  saveRequirements,
  setReqPath,
} from './Utils/Requirements/PythonRequirements';
import uninstallPython from './Utils/Uninstaller/Uninstaller';
import createPythonVenv, {getVenvs, locateVenv, removeVenvStorage} from './Utils/VirtualEnv/CreateVenv';
import {findAIVenv} from './Utils/VirtualEnv/VenvUtils';

export default function ListenForChannels(nodePty: any) {
  const storageManager = getStorage();

  ipcMain.on(pythonChannels.removeSavedPython, (_, pPath: string) => removeSavedPython(pPath));
  ipcMain.on(pythonChannels.removeSavedVenv, (_, venvPath: string) => removeVenvStorage(venvPath));
  ipcMain.on(pythonChannels.addSavedPython, (_, pPath: string) => addSavedPython(pPath));

  ipcMain.handle(pythonChannels.locatePython, (_, pPath: string) => locatePythonInstallation(pPath));
  ipcMain.handle(pythonChannels.getPackageAllVersions, (_, packageName: string) =>
    getPipPackageAllVersions(packageName),
  );

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

  ipcMain.handle(pythonChannels.getPackagesUpdateInfo, (_, packages: PackageInfo[]) => getPackagesUpdate(packages));

  ipcMain.handle(pythonChannels.updatePackage, (_, pythonPath: string, packageName: string, version?: string) =>
    updatePythonPackage(pythonPath, packageName, version),
  );
  ipcMain.handle(pythonChannels.updatePackages, (_, pythonPath: string, packages: PackageUpdate[]) =>
    updatePackages(pythonPath, packages),
  );

  ipcMain.handle(pythonChannels.readReqs, (_, filePath: string) => readRequirements(filePath));
  ipcMain.handle(pythonChannels.saveReqs, (_, filePath: string, data) => saveRequirements(filePath, data));
  ipcMain.handle(pythonChannels.findReq, (_, dirPath: string) => findValidRequirementsFiles(dirPath));

  ipcMain.on(pythonChannels.setReqPath, (_, data: IdPathType) => setReqPath(data));
  ipcMain.handle(pythonChannels.getReqPath, (_, id: string) => getReqPath(id));

  ipcMain.handle(pythonChannels.getAssociates, () => getAssociates());
  ipcMain.on(pythonChannels.addAssociate, (_, data: AssociateItem) => addAssociate(data));
  ipcMain.on(pythonChannels.removeAssociate, (_, id: string) => removeAssociate(id));
  ipcMain.on(pythonChannels.removeAssociatePath, (_, path: string) => removeAssociatePath(path));
  ipcMain.handle(pythonChannels.getExePathAssociate, (_, item: AssociateItem | string) => getExePathAssociate(item));

  ipcMain.handle(pythonChannels.findAIVenv, (_, id: string, folder: string | undefined) => findAIVenv(id, folder));

  ipcMain.handle(pythonChannels.getUpdatesReq, (_, reqFile: string, currentPackages: SitePackages_Info[]) =>
    getPackagesUpdateByReq(reqFile, currentPackages),
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

  ipcMain.handle(pythonChannels.getMaxConcurrent, () => {
    const result = storageManager?.getCustomData(MaxConcurrent_StorageID);

    if (!result) {
      storageManager?.setCustomData(MaxConcurrent_StorageID, 0);
      return 0;
    }

    return result;
  });
  ipcMain.on(pythonChannels.setMaxConcurrent, (_, value: number) => {
    storageManager?.setCustomData(MaxConcurrent_StorageID, value);
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

  ipcMain.handle(pythonChannels.getCardStartCommand, () => storageManager?.getCustomData(CardStartCommand_StorageID));
  ipcMain.on(pythonChannels.setCardStartCommand, (_, value: OnPreCommands) => {
    const currentCommands = storageManager?.getCustomData(CardStartCommand_StorageID) as OnPreCommands[] | undefined;

    if (currentCommands) {
      const existing = currentCommands.findIndex(item => item.id === value.id);
      if (existing !== -1) {
        currentCommands[existing].commands = value.commands;
      } else {
        currentCommands.push(value);
      }
    }

    storageManager?.setCustomData(CardStartCommand_StorageID, currentCommands);
  });

  ipcMain.handle(pythonChannels.replacePythonPath, (_, pythonPath: string) => {
    try {
      const defaultEnvPath = getDefaultEnvPath();
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

  ipcMain.on(pythonChannels.abortUpdateCheck, () => cancelPackagesUpdateCheck());
  ipcMain.on(pythonChannels.abortUpdating, () => abortOngoingUpdate());

  ipcMain.handle(pythonChannels.getPythonVersion, (_, pythonPath: string) => parseVersion(pythonPath));

  ipcMain.handle(pythonChannels.getAppVersion, () => app.getVersion());

  ListenForStorage(storageManager);
}
