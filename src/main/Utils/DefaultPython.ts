import {spawn} from 'node:child_process';
import {platform} from 'node:os';
import {dirname, resolve} from 'node:path';

import {promises} from 'graceful-fs';
import {homedir} from 'os';
import which from 'which';

import {
  getDefaultEnvPath,
  getStoredLynxHubDefaultPython,
  getStoredSystemDefaultPython,
  setDefaultEnvPath,
  setStoredSystemDefaultPython,
} from '../DataHolder';
import {replacePythonPath} from './ExtMainUtils';

async function validatePath(path: string): Promise<boolean> {
  try {
    await promises.access(path);
    return true;
  } catch {
    return false;
  }
}

export async function setDefaultPython(pythonPath: string): Promise<void> {
  const pathExists = await validatePath(pythonPath);
  if (!pathExists) {
    throw new Error(`Python path does not exist: ${pythonPath}`);
  }
  try {
    switch (platform()) {
      case 'win32':
        await setDefaultPythonWindows(pythonPath);
        break;
      case 'darwin':
        await setDefaultPythonMacOS(pythonPath);
        break;
      case 'linux':
        await setDefaultPythonLinux(pythonPath);
        break;
    }
    // Store the user's selection so we can reliably identify it later
    // This is especially important for Conda environments where shell auto-activation
    // would otherwise make `which python` always return the Conda base Python
    setStoredSystemDefaultPython(pythonPath);
    console.log(`Python ${pythonPath} set as default`);
  } catch (err: any) {
    throw new Error(`Failed to set Python ${pythonPath} as default: ${err.message}`);
  }
}

/**
 * Checks if the given Python installation is the system default.
 * Uses stored selection if available, otherwise falls back to detecting via `which python`.
 * On first run (no stored selection), it will detect the current system default.
 */
export async function isDefaultPython(pythonPath: string): Promise<boolean> {
  try {
    const storedDefault = getStoredSystemDefaultPython();

    // If user has explicitly set a default, use that
    if (storedDefault) {
      return await comparePythonPaths(storedDefault, pythonPath);
    }

    // First run - try to detect current system default via `which python`
    // This may return Conda's Python if Conda is auto-activated, but that's accurate
    // for what the system currently considers "default"
    const detectedDefault = await detectSystemDefaultPython();
    if (detectedDefault) {
      return await comparePythonPaths(detectedDefault, pythonPath);
    }

    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Detects the current system default Python using `which python`.
 * Returns the path or undefined if not found.
 */
async function detectSystemDefaultPython(): Promise<string | undefined> {
  try {
    // Try python first, then python3
    const pythonPath = await which('python', {path: getDefaultEnvPath()}).catch(() => null);
    if (pythonPath) return pythonPath;

    const python3Path = await which('python3', {path: getDefaultEnvPath()}).catch(() => null);
    return python3Path || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Checks if the given Python installation is the LynxHub default.
 */
export function isLynxHubDefaultPython(pythonPath: string): boolean {
  const storedDefault = getStoredLynxHubDefaultPython();
  if (!storedDefault) return false;

  const isWindows = platform() === 'win32';
  const targetPath = resolve(dirname(pythonPath));
  const storedPath = resolve(storedDefault);

  return isWindows ? targetPath.toLowerCase() === storedPath.toLowerCase() : targetPath === storedPath;
}

/**
 * Compares two Python paths, resolving symlinks on Unix systems.
 * For Conda environments, compares the install folders directly.
 */
async function comparePythonPaths(path1: string, path2: string): Promise<boolean> {
  const isWindows = platform() === 'win32';

  // Normalize to install folders (dirname of the executable)
  const dir1 = resolve(dirname(path1));
  const dir2 = resolve(dirname(path2));

  // Direct directory comparison first
  if (isWindows ? dir1.toLowerCase() === dir2.toLowerCase() : dir1 === dir2) {
    return true;
  }

  // On Unix, also try resolving symlinks for non-Conda installations
  // Conda environments don't use symlinks, so directory comparison is sufficient
  if (!isWindows) {
    const isConda1 = path1.toLowerCase().includes('conda');
    const isConda2 = path2.toLowerCase().includes('conda');

    // If either is Conda, directory comparison is the answer
    if (isConda1 || isConda2) {
      return false;
    }

    // For non-Conda, resolve symlinks
    try {
      const [resolved1, resolved2] = await Promise.all([
        promises.realpath(path1).catch(() => path1),
        promises.realpath(path2).catch(() => path2),
      ]);
      return resolved1 === resolved2;
    } catch {
      return false;
    }
  }

  return false;
}

async function setDefaultPythonWindows(pythonPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const regQuery = spawn('reg', ['query', 'HKEY_CURRENT_USER\\Environment', '/v', 'Path']);

    let queryOutput = '';

    regQuery.stdout.on('data', data => {
      queryOutput += data.toString();
    });

    regQuery.stderr.on('data', data => {
      reject(new Error(`Registry query error: ${data.toString()}`));
    });

    regQuery.on('close', code => {
      if (code !== 0) {
        reject(new Error('Failed to query registry'));
        return;
      }

      const match = queryOutput.match(/REG_\w+\s+(.+)/);
      if (!match) {
        reject(new Error('Failed to retrieve current PATH'));
        return;
      }

      const newPathValue = replacePythonPath(match[1], pythonPath);
      const defaultEnvPath = getDefaultEnvPath();
      if (defaultEnvPath) setDefaultEnvPath(replacePythonPath(defaultEnvPath, pythonPath));

      const regAdd = spawn(
        'reg',
        ['add', 'HKEY_CURRENT_USER\\Environment', '/v', 'Path', '/t', 'REG_EXPAND_SZ', '/d', newPathValue, '/f'],
        {
          timeout: 3000,
        },
      );

      let addError = '';

      regAdd.stderr.on('data', data => {
        addError += data.toString();
      });

      regAdd.on('close', code => {
        if (code !== 0) {
          reject(new Error(`Failed to update PATH: ${addError}`));
          return;
        }
        process.env.PATH = newPathValue;
        resolve();
      });
    });
  });
}

const LYNXHUB_PATH_MARKER = '# LynxHub Python Path';

async function setDefaultPythonUnix(pythonPath: string, shellConfigFile: string): Promise<void> {
  // pythonPath is the installFolder (e.g., /usr/local/bin), use it directly
  const pythonBinDir = pythonPath;

  try {
    let content = '';
    try {
      content = await promises.readFile(shellConfigFile, 'utf-8');
    } catch {
      // File doesn't exist, will create it
    }

    // Remove existing LynxHub PATH entry if present
    const lines = content.split('\n');
    const filteredLines: string[] = [];
    let skipNext = false;

    for (const line of lines) {
      if (line.includes(LYNXHUB_PATH_MARKER)) {
        skipNext = true;
        continue;
      }
      if (skipNext) {
        skipNext = false;
        continue;
      }
      filteredLines.push(line);
    }

    // Add new PATH entry at the beginning (after shebang if present)
    const pathEntry = `${LYNXHUB_PATH_MARKER}\nexport PATH="${pythonBinDir}:$PATH"`;

    let insertIndex = 0;
    if (filteredLines.length > 0 && filteredLines[0].startsWith('#!')) {
      insertIndex = 1;
    }

    filteredLines.splice(insertIndex, 0, pathEntry);

    await promises.writeFile(shellConfigFile, filteredLines.join('\n'), 'utf-8');

    // Update current process PATH
    process.env.PATH = `${pythonBinDir}:${process.env.PATH}`;

    // Also update the default env path used by the extension
    const defaultEnvPath = getDefaultEnvPath();
    if (defaultEnvPath) {
      setDefaultEnvPath(`${pythonBinDir}:${defaultEnvPath}`);
    }
  } catch (err: any) {
    throw new Error(`Failed to update shell config: ${err.message}`);
  }
}

async function setDefaultPythonMacOS(pythonPath: string): Promise<void> {
  const zshrcPath = `${homedir()}/.zshrc`;
  return setDefaultPythonUnix(pythonPath, zshrcPath);
}

async function setDefaultPythonLinux(pythonPath: string): Promise<void> {
  const bashrcPath = `${homedir()}/.bashrc`;
  return setDefaultPythonUnix(pythonPath, bashrcPath);
}
