import {IpcRendererEvent} from 'electron';

import {
  DlProgressOfficial,
  IdPathType,
  pythonChannels,
  PythonInstallation,
  PythonVersion,
  RequirementData,
  SitePackages_Info,
  VenvCreateOptions,
  VenvInfo,
} from '../../cross/extension/CrossExtTypes';

const ipc = window.electron.ipcRenderer;

const pIpc = {
  getVenvs: (): Promise<VenvInfo[]> => ipc.invoke(pythonChannels.getVenvs),
  locateVenv: (): Promise<boolean> => ipc.invoke(pythonChannels.locateVenv),
  createVenv: (options: VenvCreateOptions): Promise<boolean> => ipc.invoke(pythonChannels.createVenv, options),
  getPackagesInfo: (pythonPath: string): Promise<SitePackages_Info[]> =>
    ipc.invoke(pythonChannels.getPackagesInfo, pythonPath),
  getPackagesUpdateInfo: (pythonPath: string): Promise<SitePackages_Info[]> =>
    ipc.invoke(pythonChannels.getPackagesUpdateInfo, pythonPath),
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

  getInstalledPythons: (): Promise<PythonInstallation[]> => ipc.invoke(pythonChannels.getInstalledPythons),
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
  getAIVenvs: (): Promise<IdPathType[] | undefined> => ipc.invoke(pythonChannels.getAIVenvs),
  findAIVenv: (id: string, folder: string | undefined): Promise<string> =>
    ipc.invoke(pythonChannels.findAIVenv, id, folder),
  checkAIVenvEnabled: (): void => ipc.send(pythonChannels.checkAIVenvEnabled),

  getUpdatesReq: (
    pythonPath: string,
    reqFile: string,
    currentPackages: SitePackages_Info[],
  ): Promise<SitePackages_Info[]> => ipc.invoke(pythonChannels.getUpdatesReq, pythonPath, reqFile, currentPackages),

  readFile: (): Promise<string> => ipc.invoke(pythonChannels.readFile),
};

export default pIpc;
