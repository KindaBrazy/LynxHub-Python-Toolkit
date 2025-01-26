import {ipcMain} from 'electron';

import {
  IdPathType,
  PackageInfo,
  pythonChannels,
  PythonVersion,
  SitePackages_Info,
  VenvCreateOptions,
} from '../../cross/extension/CrossExtTypes';
import {ExtensionMainApi, MainExtensionUtils} from '../Managements/Plugin/Extensions/ExtensionTypes_Main';
import StorageManager from '../Managements/Storage/StorageManager';
import {checkAIVenvsEnabled} from './Utils/AIVenvs';
import {getAvailablePythonVersions} from './Utils/Available';
import {setDefaultPython} from './Utils/DefaultPython';
import detectPythonInstallations, {addSavedPython, removeSavedPython} from './Utils/Detector';
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

export let storageManager: StorageManager | undefined = undefined;

export async function initialExtension(lynxApi: ExtensionMainApi, utils: MainExtensionUtils) {
  utils.getStorageManager().then(storeManager => {
    storageManager = storeManager;
  });
  lynxApi.listenForChannels(() => {
    ipcMain.on(pythonChannels.removeSavedPython, (_, pPath: string) => removeSavedPython(pPath));
    ipcMain.on(pythonChannels.addSavedPython, (_, pPath: string) => addSavedPython(pPath));

    ipcMain.handle(
      pythonChannels.changePythonVersion,
      (_, pythonPath: string, packageName: string, currentVersion: string, targetVersion: string) =>
        changePythonPackageVersion(pythonPath, packageName, currentVersion, targetVersion),
    );

    ipcMain.handle(pythonChannels.getInstalledPythons, (_, refresh: boolean) => detectPythonInstallations(refresh));
    ipcMain.handle(pythonChannels.uninstallPython, (_, path: string) => uninstallPython(path));
    ipcMain.handle(pythonChannels.setDefaultPython, (_, pythonPath: string) => setDefaultPython(pythonPath));

    ipcMain.handle(pythonChannels.getAvailableOfficial, () => getAvailablePythonVersions());
    ipcMain.handle(pythonChannels.installOfficial, (_, version: PythonVersion) => downloadPython(version));

    ipcMain.handle(pythonChannels.getAvailableConda, () => listAvailablePythons());
    ipcMain.handle(pythonChannels.installConda, (_, envName: string, version: string) =>
      createCondaEnv(envName, version),
    );
    ipcMain.handle(pythonChannels.isCondaInstalled, () => isCondaInstalled());

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
  });
}

/** TODO:
 * 1. Downgrade a package
 * */
