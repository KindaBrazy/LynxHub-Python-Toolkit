import {platform} from 'node:os';
import path from 'node:path';

import {exec} from 'child_process';
import {app, BrowserWindow} from 'electron';
import {download} from 'electron-dl';
import * as tar from 'tar';
import {promisify} from 'util';

import {PythonVersion} from '../../../cross/CrossExtensions';
import {getBaseInstallPath} from './PythonUtils';

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
        await installOnMacOS(file.savePath);
        break;
      default:
        await installOnLinux(file.savePath, version.version);
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

async function installOnMacOS(installerPath: string): Promise<void> {
  await execAsync(`sudo installer -pkg "${installerPath}" -target /`);
}

async function installOnLinux(tarPath: string, version: string): Promise<void> {
  const extractPath = path.join(getBaseInstallPath(), `Python-${version}`);

  // Extract
  await tar.x({
    file: tarPath,
    cwd: getBaseInstallPath(),
  });

  // Configure and install
  await execAsync(`
            cd "${extractPath}" && \
            ./configure --enable-optimizations && \
            make -j $(nproc) && \
            sudo make altinstall
        `);
}
