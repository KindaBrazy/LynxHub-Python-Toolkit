import {execSync} from 'node:child_process';
import {platform} from 'node:os';
import {join, resolve} from 'node:path';

import {accessSync, realpathSync} from 'graceful-fs';

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

  // Filter out existing Python and Conda paths to avoid conflicts
  const nonPythonPaths = paths.filter(p => {
    const lowerPath = p.toLowerCase();
    return !lowerPath.includes('python') && !lowerPath.includes('conda') && !lowerPath.includes('miniconda');
  });

  // On Windows, installFolder is the base (e.g., C:\Python312) and Scripts is a subdirectory
  // On Unix, installFolder is already the bin directory (e.g., /usr/local/bin)
  const isWindows = platform() === 'win32';
  const newPaths = isWindows
    ? [targetPath, join(targetPath, getPythonScriptsDir()), ...nonPythonPaths]
    : [targetPath, ...nonPythonPaths];

  return newPaths.join(separator);
}

export function isFirstPythonPath(envPath: string, targetPythonBase: string): boolean {
  const targetPath = resolve(targetPythonBase);
  const pathExists = validatePath(targetPath);

  if (!pathExists) {
    return false;
  }

  const isWindows = platform() === 'win32';
  const separator = getPathSeparator();
  const paths = envPath.split(separator).filter(Boolean);

  // On Windows, compare directories directly
  if (isWindows) {
    const firstPath = paths[0];
    if (firstPath) {
      const resolvedFirst = resolve(firstPath);
      if (resolvedFirst.toLowerCase() === targetPath.toLowerCase()) return true;
    }

    // Also check for first python-like path for backward compatibility
    const firstPythonLikePath = paths.find(p => {
      const lowerP = p.toLowerCase();
      return lowerP.includes('python') || lowerP.includes('conda');
    });

    if (!firstPythonLikePath) return false;
    return resolve(firstPythonLikePath).toLowerCase() === targetPath.toLowerCase();
  }

  // On macOS/Linux, we need to resolve symlinks to compare actual paths
  // because multiple Python versions may be symlinked to the same directory (e.g., /usr/local/bin)
  const pythonExe = join(targetPath, 'python');
  const python3Exe = join(targetPath, 'python3');

  // Find the actual target executable and resolve its symlink
  let targetRealPath: string | null = null;
  try {
    if (validatePath(pythonExe)) {
      targetRealPath = realpathSync(pythonExe);
    } else if (validatePath(python3Exe)) {
      targetRealPath = realpathSync(python3Exe);
    }
  } catch {
    // If we can't resolve, fall back to directory comparison
    targetRealPath = null;
  }

  // Check the first path in PATH
  const firstPath = paths[0];
  if (firstPath) {
    const resolvedFirst = resolve(firstPath);
    if (resolvedFirst === targetPath) return true;

    // If we have a resolved target, check if the first path's python resolves to the same
    if (targetRealPath) {
      const firstPythonExe = join(resolvedFirst, 'python');
      const firstPython3Exe = join(resolvedFirst, 'python3');
      try {
        if (validatePath(firstPythonExe) && realpathSync(firstPythonExe) === targetRealPath) return true;
        if (validatePath(firstPython3Exe) && realpathSync(firstPython3Exe) === targetRealPath) return true;
      } catch {
        // Ignore resolution errors
      }
    }
  }

  // Also check for first python-like path for backward compatibility
  const firstPythonLikePath = paths.find(p => {
    const lowerP = p.toLowerCase();
    return lowerP.includes('python') || lowerP.includes('conda');
  });

  if (!firstPythonLikePath) return false;

  const resolvedPythonPath = resolve(firstPythonLikePath);
  if (resolvedPythonPath === targetPath) return true;

  // Check symlink resolution for python-like paths
  if (targetRealPath) {
    const pythonLikeExe = join(resolvedPythonPath, 'python');
    const pythonLike3Exe = join(resolvedPythonPath, 'python3');
    try {
      if (validatePath(pythonLikeExe) && realpathSync(pythonLikeExe) === targetRealPath) return true;
      if (validatePath(pythonLike3Exe) && realpathSync(pythonLike3Exe) === targetRealPath) return true;
    } catch {
      // Ignore resolution errors
    }
  }

  return false;
}
