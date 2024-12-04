import {platform} from 'node:os';
import path from 'node:path';

import {exec} from 'child_process';
import {app, BrowserWindow} from 'electron';
import {download} from 'electron-dl';
import {promisify} from 'util';

import {PythonVersion} from '../../../cross/CrossExtensions';

const execAsync = promisify(exec);

export default async function installPython(version: PythonVersion): Promise<void> {
  try {
    const file = await download(BrowserWindow.getFocusedWindow()!, version.url, {
      showBadge: false,
      directory: path.join(app.getPath('downloads'), 'LynxHub'),
    });

    switch (platform()) {
      case 'win32':
        await installOnWindows(file.savePath);
        break;
      case 'darwin':
      default:
        break;
    }

    console.log(`Python ${version.version} installed successfully`);
  } catch (error) {
    // @ts-ignore-next-line
    throw new Error(`Failed to install Python ${version.version}: ${error.message}`);
  }
}

async function installOnWindows(installerPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    execAsync(`"${installerPath}" /passive InstallAllUsers=0 PrependPath=1 Include_test=0 Include_pip=1 `)
      .then(() => resolve())
      .catch(() => {
        execAsync(`"${installerPath}" /repair`)
          .then(() => resolve())
          .catch(e => {
            reject(e);
          });
      });
  });
}
