import {spawn} from 'node:child_process';
import {dirname} from 'node:path';
import {platform} from 'node:os';

import {homedir} from 'os';
import {promises} from 'graceful-fs';
import which from 'which';

import {getDefaultEnvPath, setDefaultEnvPath} from '../DataHolder';
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
    console.log(`Python ${pythonPath} set as default`);
  } catch (err: any) {
    throw new Error(`Failed to set Python ${pythonPath} as default: ${err.message}`);
  }
}

export async function isDefaultPython(pythonPath: string): Promise<boolean> {
  try {
    const defaultPath = await which('python', {path: getDefaultEnvPath()});
    return defaultPath.toLowerCase() === pythonPath.toLowerCase();
  } catch (error) {
    return false;
  }
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
  const pythonBinDir = dirname(pythonPath);

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
