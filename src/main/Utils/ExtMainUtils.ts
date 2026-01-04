import {execSync} from 'node:child_process';
import {platform} from 'node:os';
import {join, resolve} from 'node:path';

import {accessSync} from 'graceful-fs';

export const COMMAND_LINE_ENDING = platform() === 'win32' ? '\r' : '\n';

/** Returns PowerShell version, or -1 if PowerShell is not available */
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
  } catch {
    // pwsh.exe not available, try Windows PowerShell
  }

  try {
    // Fall back to Windows PowerShell (powershell.exe)
    const psVersion = parseInt(
      execSync(`powershell.exe -NoProfile -Command "${command}"`, {
        encoding: 'utf8' as const,
        stdio: ['pipe', 'pipe', 'ignore'],
      }).trim(),
      10,
    );
    return psVersion >= 5 ? psVersion : -1;
  } catch {
    // Neither PowerShell is available
    return -1;
  }
}

export function determineShell(): string {
  switch (platform()) {
    case 'darwin':
      return 'zsh';
    case 'linux':
      return 'bash';
    case 'win32':
    default: {
      const psVersion = getPowerShellVersion();
      if (psVersion >= 7) return 'pwsh.exe';
      if (psVersion >= 5) return 'powershell.exe';
      // Fallback to cmd.exe if PowerShell is not available
      return 'cmd.exe';
    }
  }
}

export function isWin() {
  return platform() === 'win32';
}

/** Returns the PATH separator for the current platform (';' for Windows, ':' for Unix) */
function getPathSeparator(): string {
  return platform() === 'win32' ? ';' : ':';
}

/** Returns the Python scripts subdirectory name for the current platform */
function getPythonScriptsDir(): string {
  return platform() === 'win32' ? 'Scripts' : 'bin';
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

  const separator = getPathSeparator();
  const paths = envPath.split(separator).filter(Boolean);
  const nonPythonPaths = paths.filter(path => !path.toLowerCase().includes('python'));
  const newPaths = [targetPath, join(targetPath, getPythonScriptsDir()), ...nonPythonPaths];

  return newPaths.join(separator);
}

export function isFirstPythonPath(envPath: string, targetPythonBase: string): boolean {
  const targetPath = resolve(targetPythonBase);
  const pathExists = validatePath(targetPath);

  if (!pathExists) {
    return false;
  }

  const separator = getPathSeparator();
  const paths = envPath.split(separator).filter(Boolean);

  // On Unix, Python might be in paths like /usr/local/bin which don't contain "python" in the name
  // Check if the target path is the first path in PATH, or the first python-like path
  const firstPath = paths[0];
  if (firstPath) {
    const resolvedFirst = resolve(firstPath);
    const isWindows = platform() === 'win32';
    const matches = isWindows ? resolvedFirst.toLowerCase() === targetPath.toLowerCase() : resolvedFirst === targetPath;
    if (matches) return true;
  }

  // Also check for first python-like path for backward compatibility
  const firstPythonLikePath = paths.find(p => {
    const lowerP = p.toLowerCase();
    return lowerP.includes('python') || lowerP.includes('conda');
  });

  if (!firstPythonLikePath) {
    return false;
  }

  const isWindows = platform() === 'win32';
  return isWindows
    ? resolve(firstPythonLikePath).toLowerCase() === targetPath.toLowerCase()
    : resolve(firstPythonLikePath) === targetPath;
}
