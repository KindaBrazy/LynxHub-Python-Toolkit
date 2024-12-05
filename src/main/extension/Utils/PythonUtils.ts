import {platform} from 'node:os';
import {join, resolve} from 'node:path';

import {exec} from 'child_process';
import {existsSync, promises, readdirSync, statSync} from 'graceful-fs';
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
      return join(homedir(), 'AppData', 'Local', 'Programs', 'Python');
    case 'darwin':
    default:
      return '';
  }
}

export async function parseVersion(pythonPath: string): Promise<{major: number; minor: number; patch: number}> {
  try {
    const {stdout} = await execAsync(`"${pythonPath}" --version 2>&1`);
    const versionMatch = stdout.trim().match(/Python (\d+)\.(\d+)(?:\.(\d+))?/i);

    if (!versionMatch) {
      throw new Error('Unable to parse version string');
    }

    const [, major, minor, patch] = versionMatch;
    return {
      major: Number(major),
      minor: Number(minor),
      patch: patch ? Number(patch) : 0,
    };
  } catch (error) {
    throw new Error(`Failed to parse Python version: ${error}`);
  }
}

export function findFileInDir(dirPath: string, fileName: string | undefined): string | null {
  if (!fileName) return null;
  const files = readdirSync(dirPath);

  for (const file of files) {
    const filePath = join(dirPath, file);
    const stats = statSync(filePath);

    if (stats.isDirectory()) {
      const result = findFileInDir(filePath, fileName);
      if (result) {
        return result;
      }
    } else if (stats.isFile() && file.toLowerCase().includes(fileName.toLowerCase())) {
      return filePath;
    }
  }

  return null;
}

export async function removeDir(dir: string): Promise<void> {
  try {
    const resolvedPath = resolve(dir);
    console.log(`Removing directory: ${resolvedPath}`);
    return await promises.rm(resolvedPath, {recursive: true, force: true});
  } catch (e) {
    console.error(e);
    throw e;
  }
}
