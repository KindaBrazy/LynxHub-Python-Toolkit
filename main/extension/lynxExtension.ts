import {ipcMain} from 'electron';

import {ExtensionMainApi, MainExtensionUtils} from '../Managements/Plugin/Extensions/ExtensionTypes_Main';
import PythonDetector from './PythonDetector';

export async function initialExtension(lynxApi: ExtensionMainApi, _utils: MainExtensionUtils) {
  lynxApi.listenForChannels(() => {
    const detector = new PythonDetector();
    ipcMain.handle('get-pythons', async () => {
      return await detector.detectPythonInstallations();
    });
    ipcMain.handle('uninstall-python', async (_, path: string) => {
      return await detector.uninstallPython(path);
    });
  });
}
