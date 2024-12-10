import {ipcMain} from 'electron';

import {pythonChannels, PythonVersion} from '../../cross/CrossExtensions';
import {ExtensionMainApi, MainExtensionUtils} from '../Managements/Plugin/Extensions/ExtensionTypes_Main';
import {getAvailablePythonVersions} from './Utils/Available';
import {setDefaultPython} from './Utils/DefaultPython';
import detectPythonInstallations from './Utils/Detector';
import {createEnvWithPython, isCondaInstalled, listAvailablePythons} from './Utils/Installer/Installer_Conda';
import downloadPython from './Utils/Installer/Installer_Official';
import uninstallPython from './Utils/Uninstaller/Uninstaller';

export async function initialExtension(lynxApi: ExtensionMainApi, _utils: MainExtensionUtils) {
  lynxApi.listenForChannels(() => {
    ipcMain.handle(pythonChannels.getInstalledPythons, () => detectPythonInstallations());
    ipcMain.handle(pythonChannels.uninstallPython, (_, path: string) => uninstallPython(path));
    ipcMain.handle(pythonChannels.setDefaultPython, (_, pythonPath: string) => setDefaultPython(pythonPath));

    ipcMain.handle(pythonChannels.getAvailableOfficial, () => getAvailablePythonVersions());
    ipcMain.handle(pythonChannels.installOfficial, (_, version: PythonVersion) => downloadPython(version));

    ipcMain.handle(pythonChannels.getAvailableConda, () => listAvailablePythons());
    ipcMain.handle(pythonChannels.installConda, (_, envName: string, version: string) =>
      createEnvWithPython(envName, version),
    );
    ipcMain.handle(pythonChannels.isCondaInstalled, () => isCondaInstalled());
  });
}
