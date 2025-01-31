import {execSync} from 'node:child_process';
import {platform} from 'node:os';

export const COMMAND_LINE_ENDING = platform() === 'win32' ? '\r' : '\n';

function getPowerShellVersion(): number {
  const command = '$PSVersionTable.PSVersion.Major';

  try {
    const pwshVersion = parseInt(
      execSync(`pwsh.exe -NoProfile -Command "${command}"`, {
        encoding: 'utf8' as const,
        stdio: ['pipe', 'pipe', 'ignore'],
      }).trim(),
      10,
    );
    if (pwshVersion >= 7) return pwshVersion;

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

export function determineShell(): string {
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
