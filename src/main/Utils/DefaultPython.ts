import {spawn} from 'node:child_process';
import {platform} from 'node:os';
import {join} from 'node:path';

import {promises} from 'graceful-fs';
import which from 'which';

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
      case 'linux':
        break;
    }
    console.log(`Python ${pythonPath} set as default`);
  } catch (err: any) {
    throw new Error(`Failed to set Python ${pythonPath} as default: ${err.message}`);
  }
}

export async function isDefaultPython(pythonPath: string): Promise<boolean> {
  try {
    const defaultPath = await which('python');
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

      // Process paths
      const paths = match[1].split(';').filter(Boolean);
      const nonPythonPaths = paths.filter(path => !path.toLowerCase().includes('python'));
      const newPaths = [pythonPath, join(pythonPath, 'Scripts'), ...nonPythonPaths];
      const newPathValue = newPaths.join(';');

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
