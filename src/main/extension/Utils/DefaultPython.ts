import {platform} from 'node:os';
import {join} from 'node:path';

import {exec} from 'child_process';
import {promises} from 'graceful-fs';
import {promisify} from 'util';
import which from 'which';

const execAsync = promisify(exec);

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
  return new Promise(async (resolve, reject) => {
    try {
      const {stdout: currentPath} = await execAsync('reg query "HKEY_CURRENT_USER\\Environment" /v Path');

      const match = currentPath.match(/REG_\w+\s+(.+)/);
      if (!match) {
        reject(new Error('Failed to retrieve current PATH'));
      }

      const paths = match ? match[1].split(';').filter(Boolean) : [];

      const nonPythonPaths = paths.filter(path => !path.toLowerCase().includes('python'));

      const newPaths = [pythonPath, join(pythonPath, 'Scripts'), ...nonPythonPaths];

      const newPathValue = newPaths.join(';');

      const regCommand = `REG ADD "HKEY_CURRENT_USER\\Environment" /v Path /t REG_EXPAND_SZ /d "${newPathValue}" /f`;

      await execAsync(regCommand);

      process.env.PATH = newPathValue;
      resolve();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      reject(new Error(`Failed to update Python path: ${errorMessage}`));
    }
  });
}
