import {execSync} from 'node:child_process';
import {platform} from 'node:os';
import {join, resolve} from 'node:path';

import {accessSync} from 'graceful-fs';

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

export function isWin() {
  return platform() === 'win32';
}

function validatePath(path: string): boolean {
  try {
    accessSync(path);
    return true;
  } catch {
    return false;
  }
}

export function replacePythonPath(envPath: string, newPythonBase: string): string {
  const targetPath = resolve(newPythonBase);
  const pathExists = validatePath(targetPath);

  if (!pathExists) {
    throw new Error(`Python path does not exist: ${targetPath}`);
  }

  const paths = envPath.split(';').filter(Boolean);
  const nonPythonPaths = paths.filter(path => !path.toLowerCase().includes('python'));
  const newPaths = [targetPath, join(targetPath, 'Scripts'), ...nonPythonPaths];

  return newPaths.join(';');
}

export function isFirstPythonPath(envPath: string, targetPythonBase: string): boolean {
  const targetPath = resolve(targetPythonBase);
  const pathExists = validatePath(targetPath);

  if (!pathExists) {
    return false;
  }

  const paths = envPath.split(';').filter(Boolean);

  const firstPythonLikePath = paths.find(p => {
    const lowerP = p.toLowerCase();
    return lowerP.includes('python') || lowerP.includes('conda');
  });

  if (!firstPythonLikePath) {
    return false;
  }

  return resolve(firstPythonLikePath).toLowerCase() === targetPath.toLowerCase();
}
