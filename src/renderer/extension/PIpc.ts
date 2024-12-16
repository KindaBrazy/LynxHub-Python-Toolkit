import {IpcRendererEvent} from 'electron';

import {
  DlProgressOfficial,
  pythonChannels,
  PythonInstallation,
  PythonVersion,
  RequirementData,
  SitePackages_Info,
  VenvCreateOptions,
  VenvInfo,
} from '../../cross/CrossExtensions';

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
  installPackage: (pythonPath: string, packageName: string): Promise<string> =>
    ipc.invoke(pythonChannels.installPackage, pythonPath, packageName),
  updatePackage: (pythonPath: string, packageName: string): Promise<string> =>
    ipc.invoke(pythonChannels.updatePackage, pythonPath, packageName),
  uninstallPackage: (pythonPath: string, packageName: string): Promise<string> =>
    ipc.invoke(pythonChannels.uninstallPackage, pythonPath, packageName),
  readReqs: (filePath: string): Promise<RequirementData[]> => ipc.invoke(pythonChannels.readReqs, filePath),
  saveReqs: (filePath: string, data: RequirementData[]): Promise<RequirementData[]> =>
    ipc.invoke(pythonChannels.saveReqs, filePath, data),
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
};

export default pIpc;
