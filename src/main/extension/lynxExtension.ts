import {ipcMain} from 'electron';

import {PythonVersion} from '../../cross/CrossExtensions';
import {ExtensionMainApi, MainExtensionUtils} from '../Managements/Plugin/Extensions/ExtensionTypes_Main';
import {getAvailablePythonVersions} from './Utils/Available';
import {setDefaultPython} from './Utils/DefaultPython';
import detectPythonInstallations from './Utils/Detector';
import downloadPython from './Utils/Installer';
import uninstallPython from './Utils/Uninstaller/Uninstaller';

export async function initialExtension(lynxApi: ExtensionMainApi, _utils: MainExtensionUtils) {
  lynxApi.listenForChannels(() => {
    ipcMain.handle('get-pythons', () => detectPythonInstallations());
    ipcMain.handle('uninstall-python', (_, path: string) => uninstallPython(path));
    ipcMain.handle('get-available-pythons', () => getAvailablePythonVersions());
    ipcMain.handle('install-python', (_, version: PythonVersion) => downloadPython(version));
    ipcMain.handle('set-default-python', (_, pythonPath: string) => setDefaultPython(pythonPath));
  });
}
