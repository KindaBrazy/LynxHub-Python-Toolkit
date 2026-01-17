import {platform} from 'node:os';

import {ptyChannels} from '@lynx_cross/consts/ipc';
import {IPty} from 'node-pty';

import {PackageUpdate} from '../../../cross/CrossExtTypes';
import {getAppManager, getNodePty} from '../../DataHolder';
import {COMMAND_LINE_ENDING, determineShell} from '../ExtMainUtils';

let ptyProcess: IPty | undefined = undefined;

function startPtyUpdate(pythonExePath: string, packageSpecs: string): Promise<void> {
  return new Promise(resolve => {
    ptyProcess = getNodePty()?.spawn(determineShell(), [], {});
    const webContent = getAppManager()?.getWebContent();

    if (ptyProcess && webContent && !webContent.isDestroyed()) {
      // On Windows use '&' operator, on Unix systems run command directly in the spawned shell
      const updateCommand =
        platform() === 'win32'
          ? `& "${pythonExePath}" -m pip install --upgrade ${packageSpecs}`
          : `"${pythonExePath}" -m pip install --upgrade ${packageSpecs}`;

      ptyProcess.write(`${updateCommand}${COMMAND_LINE_ENDING}`);
      ptyProcess.write(`exit${COMMAND_LINE_ENDING}`);

      ptyProcess.onData(data => {
        webContent.send(ptyChannels.onData, 'python-update', data);
      });

      ptyProcess.onExit(() => {
        webContent.send(ptyChannels.onExit, 'python-update');
        ptyProcess?.kill();
        ptyProcess = undefined;
        resolve();
      });
    }
  });
}

export async function updatePythonPackage(pythonExePath: string, packageName: string, version?: string) {
  const packageSpecifier = version ? `${packageName}==${version}` : packageName;
  return startPtyUpdate(pythonExePath, packageSpecifier);
}

export async function updatePackages(pythonExePath: string, packages: PackageUpdate[]) {
  if (ptyProcess || packages.length === 0) return;

  const packageSpecs = packages
    .map(pkg => (pkg.targetVersion ? `${pkg.name}==${pkg.targetVersion}` : pkg.name))
    .join(' ');

  return startPtyUpdate(pythonExePath, packageSpecs);
}

export function abortOngoingUpdate(): void {
  if (ptyProcess) {
    ptyProcess.kill();
    console.log('Cancellation signal sent to package update process.');
  } else {
    console.log('No ongoing package update to cancel.');
  }
}
