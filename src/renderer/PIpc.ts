import {IpcRendererEvent} from 'electron';

import {
  DlProgressOfficial,
  IdPathType,
  PackageInfo,
  PkgDisplayType,
  pythonChannels,
  PythonInstallation,
  PythonVersion,
  RequirementData,
  SitePackages_Info,
  VenvCreateOptions,
  VenvInfo,
} from '../cross/CrossExtTypes';

const ipc = window.electron.ipcRenderer;

const pIpc = {
  removeSavedPython: (pPath: string) => ipc.send(pythonChannels.removeSavedPython, pPath),
  addSavedPython: (pPath: string) => ipc.send(pythonChannels.addSavedPython, pPath),

  changePackageVersion: (pythonPath: string, packageName: string, currentVersion: string, targetVersion: string) =>
    ipc.invoke(pythonChannels.changePythonVersion, pythonPath, packageName, currentVersion, targetVersion),

  getVenvs: (): Promise<VenvInfo[]> => ipc.invoke(pythonChannels.getVenvs),
  locateVenv: (): Promise<boolean> => ipc.invoke(pythonChannels.locateVenv),
  createVenv: (options: VenvCreateOptions): Promise<boolean> => ipc.invoke(pythonChannels.createVenv, options),
  getPackagesInfo: (pythonPath: string): Promise<SitePackages_Info[]> =>
    ipc.invoke(pythonChannels.getPackagesInfo, pythonPath),
  getPackagesUpdateInfo: (packages: PackageInfo[]): Promise<SitePackages_Info[]> =>
    ipc.invoke(pythonChannels.getPackagesUpdateInfo, packages),
  updateAllPackages: (pythonPath: string, packages: string[]): Promise<string> =>
    ipc.invoke(pythonChannels.updateAllPackages, pythonPath, packages),
  installPackage: (pythonPath: string, command: string): Promise<string> =>
    ipc.invoke(pythonChannels.installPackage, pythonPath, command),
  updatePackage: (pythonPath: string, packageName: string): Promise<string> =>
    ipc.invoke(pythonChannels.updatePackage, pythonPath, packageName),
  uninstallPackage: (pythonPath: string, packageName: string): Promise<string> =>
    ipc.invoke(pythonChannels.uninstallPackage, pythonPath, packageName),

  readReqs: (filePath: string): Promise<RequirementData[]> => ipc.invoke(pythonChannels.readReqs, filePath),
  saveReqs: (filePath: string, data: RequirementData[]): Promise<RequirementData[]> =>
    ipc.invoke(pythonChannels.saveReqs, filePath, data),
  findReq: (dirPath: string): Promise<string | undefined> => ipc.invoke(pythonChannels.findReq, dirPath),
  setReqPath: (data: IdPathType): void => ipc.send(pythonChannels.setReqPath, data),
  getReqPath: (id: string): Promise<string | undefined> => ipc.invoke(pythonChannels.getReqPath, id),

  getInstalledPythons: (refresh: boolean): Promise<PythonInstallation[]> =>
    ipc.invoke(pythonChannels.getInstalledPythons, refresh),
  setDefaultPython: (pythonPath: string): Promise<void> => ipc.invoke(pythonChannels.setDefaultPython, pythonPath),
  uninstallPython: (
    path: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> => ipc.invoke(pythonChannels.uninstallPython, path),
  getAvailableOfficial: (): Promise<PythonVersion[]> => ipc.invoke(pythonChannels.getAvailableOfficial),

  off_DlProgressOfficial: (): void => ipc.removeAllListeners(pythonChannels.downloadProgressOfficial),
  on_DlProgressOfficial: (
    result: (event: IpcRendererEvent, stage: 'installing' | 'downloading', progress: DlProgressOfficial) => void,
  ) => ipc.on(pythonChannels.downloadProgressOfficial, result),

  installOfficial: (version: PythonVersion): Promise<void> => ipc.invoke(pythonChannels.installOfficial, version),
  getAvailableConda: (): Promise<string[]> => ipc.invoke(pythonChannels.getAvailableConda),

  off_DlProgressConda: (): void => ipc.removeAllListeners(pythonChannels.downloadProgressConda),
  on_DlProgressConda: (result: (event: IpcRendererEvent, progress: number) => void) =>
    ipc.on(pythonChannels.downloadProgressConda, result),
  installConda: (envName: string, version: string): Promise<void> =>
    ipc.invoke(pythonChannels.installConda, envName, version),
  isCondaInstalled: (): Promise<boolean> => ipc.invoke(pythonChannels.isCondaInstalled),

  locateAIVenv: (id: string): Promise<string> => ipc.invoke(pythonChannels.locateAIVenv, id),
  getAIVenv: (id: string): Promise<string | undefined> => ipc.invoke(pythonChannels.getAIVenv, id),
  addAIVenv: (id: string, pythonPath: string): void => ipc.send(pythonChannels.addAIVenv, id, pythonPath),
  removeAIVenv: (id: string): void => ipc.send(pythonChannels.removeAIVenv, id),
  removeAIVenvPath: (path: string): void => ipc.send(pythonChannels.removeAIVenvPath, path),
  getAIVenvs: (): Promise<IdPathType[] | undefined> => ipc.invoke(pythonChannels.getAIVenvs),
  findAIVenv: (id: string, folder: string | undefined): Promise<string> =>
    ipc.invoke(pythonChannels.findAIVenv, id, folder),
  checkAIVenvEnabled: (): void => ipc.send(pythonChannels.checkAIVenvEnabled),

  getUpdatesReq: (reqFile: string, currentPackages: SitePackages_Info[]): Promise<SitePackages_Info[]> =>
    ipc.invoke(pythonChannels.getUpdatesReq, reqFile, currentPackages),

  readFile: (): Promise<string> => ipc.invoke(pythonChannels.readFile),

  getMaxRetry: (): Promise<number> => ipc.invoke(pythonChannels.getMaxRetry),
  setMaxRetry: (value: number) => ipc.send(pythonChannels.setMaxRetry, value),

  getPkgDisplay: (): Promise<PkgDisplayType> => ipc.invoke(pythonChannels.getPkgDisplay),
  setPkgDisplay: (value: PkgDisplayType) => ipc.send(pythonChannels.setPkgDisplay, value),

  getCacheStorageUsage: (): Promise<boolean> => ipc.invoke(pythonChannels.getCacheStorageUsage),
  setCacheStorageUsage: (value: boolean) => ipc.send(pythonChannels.setCacheStorageUsage, value),

  replacePythonPath: (pythonPath: string): Promise<boolean> => ipc.invoke(pythonChannels.replacePythonPath, pythonPath),
};

export default pIpc;
