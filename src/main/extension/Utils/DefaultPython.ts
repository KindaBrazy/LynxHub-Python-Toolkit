import {platform} from 'node:os';

import {exec} from 'child_process';
import {promises} from 'graceful-fs';
import {promisify} from 'util';
import which from 'which';

const execAsync = promisify(exec);

// Helper function to validate path exists
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
  } catch (error) {
    // @ts-ignore-next-line
    throw new Error(`Failed to set Python ${pythonPath} as default: ${error.message}`);
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
  try {
    // Get current user's PATH from registry
    const {stdout: currentPath} = await execAsync('reg query "HKEY_CURRENT_USER\\Environment" /v Path');

    // Extract the current PATH value
    const match = currentPath.match(/REG_\w+\s+(.+)/);
    if (!match) {
      throw new Error('Failed to retrieve current PATH');
    }

    // Get existing paths
    const paths = match[1].split(';').filter(Boolean);

    // Remove existing Python paths
    const nonPythonPaths = paths.filter(path => !path.toLowerCase().includes('python'));

    // Add new Python path at the beginning
    const newPaths = [pythonPath, ...nonPythonPaths];

    // Construct new PATH value
    const newPathValue = newPaths.join(';');

    // Use REG ADD with proper escaping and quotes
    const regCommand = `REG ADD "HKEY_CURRENT_USER\\Environment" /v Path /t REG_EXPAND_SZ /d "${newPathValue}" /f`;

    // Execute the registry update
    await execAsync(regCommand);

    // Update current process PATH
    process.env.PATH = newPathValue;

    console.log('Python path updated successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to update Python path: ${errorMessage}`);
  }
}
