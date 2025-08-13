import {platform} from 'node:os';
import {join} from 'node:path';

import {exec} from 'child_process';
import {app, BrowserWindow} from 'electron';
import {download} from 'electron-dl';
import {promisify} from 'util';

import {pythonChannels, PythonVersion} from '../../../cross/CrossExtTypes';
import {findFileInDir} from '../PythonUtils';

const execAsync = promisify(exec);

async function installPython(filePath: string, version: PythonVersion): Promise<void> {
  try {
    switch (platform()) {
      case 'win32':
        await installOnWindows(filePath);
        break;
      case 'linux':
        await installOnLinux(version.version);
        break;
      case 'darwin':
      default:
        break;
    }

    console.log(`Python ${version.version} installed successfully`);
  } catch (err: any) {
    console.error(`Failed to install Python ${version.version}: ${err.message}`);
    throw new Error(`Failed to install Python ${version.version}: ${err.message}`);
  }
}

export default async function downloadPython(version: PythonVersion): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const window = BrowserWindow.getFocusedWindow()!;

    const fileName = version.url.split('/').pop();
    const targetPath = join(app.getPath('downloads'), 'LynxHub');

    const found = findFileInDir(targetPath, fileName);

    if (found) {
      try {
        window.webContents.send(pythonChannels.downloadProgressOfficial, 'installing');
        await installPython(found, version);
        resolve();
      } catch (e) {
        reject(e);
      }
    } else {
      download(window, version.url, {
        showBadge: false,
        directory: targetPath,
        onProgress: progress => {
          window.webContents.send(pythonChannels.downloadProgressOfficial, 'downloading', {
            percentage: progress.percent,
            downloaded: progress.transferredBytes,
            total: progress.totalBytes,
          });
        },
      })
        .then(async item => {
          window.webContents.send(pythonChannels.downloadProgressOfficial, 'installing');
          try {
            await installPython(item.savePath, version);
            resolve();
          } catch (e) {
            reject(e);
          }
        })
        .catch((err: any) => {
          console.error(`Failed to download Python ${version.version}: ${err.message}`);
          reject(`Failed to download Python ${version.version}: ${err.message}`);
        });
    }
  });
}

async function installOnWindows(installerPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    execAsync(`"${installerPath}" /quiet InstallAllUsers=0 PrependPath=1 Include_test=0 Include_pip=1 `)
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

async function installOnLinux(version: string): Promise<void> {
  const pythonVersion = `python${version}`;
  const packagesToInstall = `${pythonVersion} ${pythonVersion}-dev ${pythonVersion}-venv`;
  const command = `pkexec apt install ${packagesToInstall} -y`;
  return new Promise((resolve, reject) => {
    try {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing command: ${command}`);
          console.error(stderr);
          reject(error);
        } else {
          console.log(`Command executed successfully: ${command}`);
          console.log(stdout);
          resolve();
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}
