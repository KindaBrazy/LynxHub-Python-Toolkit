import {execSync} from 'node:child_process';
import {platform} from 'node:os';

import {IPty} from 'node-pty';

import {ptyChannels} from '../../../../../src/cross/IpcChannelAndTypes';
import {PackageUpdate} from '../../../cross/CrossExtTypes';
import {getAppManager, getNodePty} from '../../DataHolder';

function getPowerShellVersion(): number {
  const command = '$PSVersionTable.PSVersion.Major';

  try {
    // Try PowerShell Core (pwsh.exe) first
    const pwshVersion = parseInt(
      execSync(`pwsh.exe -NoProfile -Command "${command}"`, {
        encoding: 'utf8' as const,
        stdio: ['pipe', 'pipe', 'ignore'],
      }).trim(),
      10,
    );
    if (pwshVersion >= 7) return pwshVersion;

    // Fall back to Windows PowerShell (powershell.exe)
    const psVersion = parseInt(
      execSync(`powershell.exe -NoProfile -Command "${command}"`, {
        encoding: 'utf8' as const,
        stdio: ['pipe', 'pipe', 'ignore'],
      }).trim(),
      10,
    );
    return psVersion >= 5 ? psVersion : 0;
  } catch (err) {
    console.error('Error determining PowerShell version:', err);
    return 0;
  }
}

function determineShell(): string {
  switch (platform()) {
    case 'darwin':
      return 'zsh';
    case 'linux':
      return 'bash';
    case 'win32':
    default:
      return getPowerShellVersion() >= 5 ? 'pwsh.exe' : 'powershell.exe';
  }
}

const LINE_ENDING = platform() === 'win32' ? '\r' : '\n';
const platformOperator = platform() === 'win32' ? '&' : 'bash';
let ptyProcess: IPty | undefined = undefined;

function startPtyUpdate(pythonExePath: string, packageSpecs: string): Promise<void> {
  return new Promise(resolve => {
    ptyProcess = getNodePty()?.spawn(determineShell(), [], {});
    const webContent = getAppManager()?.getWebContent();

    if (ptyProcess && webContent && !webContent.isDestroyed()) {
      const updateCommand = `${platformOperator} "${pythonExePath}" -m pip install --upgrade ${packageSpecs}`;

      ptyProcess.write(`${updateCommand}${LINE_ENDING}`);
      ptyProcess.write(`exit${LINE_ENDING}`);

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
