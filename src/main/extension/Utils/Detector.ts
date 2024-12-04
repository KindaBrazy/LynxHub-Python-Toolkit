import {basename, dirname, join} from 'node:path';

import {exec} from 'child_process';
import {existsSync, promises} from 'graceful-fs';
import {arch, homedir, platform} from 'os';
import {promisify} from 'util';
import which from 'which';

import {PythonInstallation} from '../../../cross/CrossExtensions';
import {isDefaultPython} from './DefaultPython';
import {detectInstallationType, parseVersion} from './PythonUtils';

const execAsync = promisify(exec);

const commonPaths: {[key: string]: string[]} = {
  win32: [
    'C:\\Python*',
    'C:\\Program Files\\Python*',
    'C:\\Program Files (x86)\\Python*',
    '%LOCALAPPDATA%\\Programs\\Python*',
    '%USERPROFILE%\\AppData\\Local\\Programs\\Python*',
    '%USERPROFILE%\\Anaconda3',
    '%USERPROFILE%\\Anaconda3\\envs*',
    '%USERPROFILE%\\Miniconda3',
    '%USERPROFILE%\\Miniconda3\\envs*',
  ],
};

function matchPattern(filename: string, pattern: string): boolean {
  const regexPattern = pattern.replace(/\*/g, '.*');
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(filename);
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findPythonInPath(): Promise<string[]> {
  try {
    const paths: string[] = [];
    const pythonCommands = ['python', 'python3'];

    for (const cmd of pythonCommands) {
      try {
        const path = await which(cmd);
        if (path) paths.push(path.replace('.EXE', '.exe'));
      } catch (error) {
        // Command not found, continue
      }
    }

    return paths;
  } catch (error) {
    return [];
  }
}

async function findInCommonLocations(): Promise<string[]> {
  const os = platform();
  const paths = commonPaths[os] || [];
  const expandedPaths: string[] = [];

  for (const pathPattern of paths) {
    const expandedPath = pathPattern
      .replace('%LOCALAPPDATA%', process.env.LOCALAPPDATA || '')
      .replace('%USERPROFILE%', homedir())
      .replace('~', homedir());

    // Handle wildcards in the path
    const basePath = dirname(expandedPath);
    const pattern = basename(expandedPath);

    try {
      const files = await promises.readdir(basePath);
      for (const file of files) {
        if (matchPattern(file, pattern)) {
          const fullPath = join(basePath, file);
          const stats = await promises.stat(fullPath);
          if (stats.isDirectory()) {
            const pythonExecutable = join(fullPath, 'python.exe');
            if (await fileExists(pythonExecutable)) {
              expandedPaths.push(pythonExecutable);
            } else {
              // Check for subdirectories
              const subFiles = await promises.readdir(fullPath);
              for (const subFile of subFiles) {
                const subPath = join(fullPath, subFile);
                const subStats = await promises.stat(subPath);
                if (subStats.isDirectory()) {
                  const subPythonExecutable = join(subPath, 'python.exe');
                  if (await fileExists(subPythonExecutable)) {
                    expandedPaths.push(subPythonExecutable);
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${basePath}:`, error);
    }
  }

  return expandedPaths;
}

async function detectArchitecture(pythonPath: string): Promise<'32bit' | '64bit'> {
  try {
    const {stdout} = await execAsync(`"${pythonPath}" -c "import struct; print(struct.calcsize('P') * 8)"`);
    return stdout.trim() === '64' ? '64bit' : '32bit';
  } catch (error) {
    return arch() === 'x64' ? '64bit' : '32bit';
  }
}

async function getPipPath(pythonPath: string): Promise<string | undefined> {
  try {
    const {stdout} = await execAsync(`"${pythonPath}" -m pip --version`);
    const pipPath = stdout.split(' ')[1];
    return existsSync(pipPath) ? pipPath : undefined;
  } catch (error) {
    return undefined;
  }
}

async function getVenvPaths(pythonPath: string): Promise<string[]> {
  try {
    const {stdout} = await execAsync(`"${pythonPath}" -c "import sys; print('\\n'.join(sys.path))"`);
    return stdout
      .split('\n')
      .filter(path => path.includes('venv') || path.includes('virtualenv'))
      .map(path => path.trim());
  } catch (error) {
    return [];
  }
}

async function getSitePackagesPath(pythonPath: string): Promise<string> {
  try {
    const {stdout} = await execAsync(`"${pythonPath}" -c "import site; print(site.getsitepackages()[0])"`);
    return stdout.trim();
  } catch (error) {
    throw new Error(`Failed to get site-packages location: ${error}`);
  }
}

export default async function detectPythonInstallations(): Promise<PythonInstallation[]> {
  const installations: PythonInstallation[] = [];
  const paths = new Set<string>();

  // Collect paths from all sources
  const pathSources = await Promise.all([findPythonInPath(), findInCommonLocations()]);

  pathSources.flat().forEach(path => paths.add(path));

  // Analyze each unique Python installation
  for (const pythonPath of paths) {
    try {
      const version = await parseVersion(pythonPath);
      const isDefault = await isDefaultPython(pythonPath);
      const installation: PythonInstallation = {
        version: `${version.major}.${version.minor}.${version.patch}`,
        installationType: await detectInstallationType(pythonPath),
        architecture: await detectArchitecture(pythonPath),
        installPath: pythonPath,
        installFolder: dirname(pythonPath),
        pipPath: await getPipPath(pythonPath),
        venvPaths: await getVenvPaths(pythonPath),
        sitePackagesPath: await getSitePackagesPath(pythonPath),
        isDefault,
      };
      installations.push(installation);
    } catch (error) {
      console.error(`Error analyzing Python installation at ${pythonPath}:`, error);
    }
  }

  return installations;
}
