import {platform} from 'node:os';
import path from 'node:path';

import {exec} from 'child_process';
import {existsSync} from 'fs';
import {homedir} from 'os';
import {promisify} from 'util';

import {PythonInstallation} from '../../../cross/CrossExtensions';

const execAsync = promisify(exec);

export async function detectInstallationType(pythonPath: string): Promise<PythonInstallation['installationType']> {
  // Helper function to normalize string comparisons
  const normalize = (str: string) => str.toLowerCase();

  try {
    // Validate if the pythonPath is a valid executable
    if (!existsSync(pythonPath)) {
      return 'other'; // Invalid path
    }

    // Check for known patterns in the path
    const normalizedPath = normalize(pythonPath);
    if (normalizedPath.includes('conda')) return 'conda';

    // Execute a Python command to get environment details
    const {stdout} = await execAsync(`"${pythonPath}" -c "import sys; print(sys.prefix)"`);
    const normalizedStdout = normalize(stdout);

    // Check the output of the Python command
    if (normalizedStdout.includes('conda')) return 'conda';

    // System-wide or default installation
    const {stdout: versionStdout} = await execAsync(`"${pythonPath}" --version`);
    if (versionStdout.toLowerCase().includes('python')) {
      return 'official';
    }

    // If no match, classify as 'other'
    return 'other';
  } catch (error) {
    // Handle unexpected errors
    console.error(`Error detecting installation type for ${pythonPath}:`, error);
    return 'other';
  }
}

export function getBaseInstallPath(): string {
  switch (platform()) {
    case 'win32':
      return path.join(homedir(), 'AppData', 'Local', 'Programs', 'Python');
    case 'darwin':
      return '/usr/local/opt/python';
    default:
      return '/usr/local/python';
  }
}

export async function parseVersion(pythonPath: string): Promise<{major: number; minor: number; patch: number}> {
  try {
    const {stdout} = await execAsync(`"${pythonPath}" --version`);
    const version = stdout.trim().split(' ')[1];
    const [major, minor, patch] = version.split('.').map(Number);
    return {major, minor, patch};
  } catch (error) {
    throw new Error(`Failed to parse Python version: ${error}`);
  }
}
