import {basename, dirname, join} from 'node:path';

import {exec} from 'child_process';
import {existsSync, promises} from 'graceful-fs';
import {compact, isEmpty, isNil} from 'lodash';
import {arch, homedir, platform} from 'os';
import {promisify} from 'util';
import which from 'which';

import {PythonInstallation} from '../../../cross/extension/CrossExtTypes';
import {storageManager} from '../lynxExtension';
import {isDefaultPython} from './DefaultPython';
import {detectInstallationType, getSitePackagesCount, parseVersion} from './PythonUtils';
import {getCondaEnvName} from './Uninstaller/Uninstaller_Conda';

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

function matchPattern(file: string, pattern: string) {
  const regexPattern = pattern.replace(/\*/g, '.*');
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(file);
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
        // Command wasn't found, continue
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
    const match = stdout.match(/pip \d+\.\d+\.\d+ from (\S+)/);
    if (match && match[1]) {
      const pipPath = match[1];
      return existsSync(pipPath) ? pipPath : undefined;
    }
  } catch (error) {
    // Ignore error
  }
  return undefined;
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
    const {stdout} = await execAsync(`"${pythonPath}" -c "import site; print(site.getsitepackages()[1])"`);
    return stdout.trim();
  } catch (error) {
    throw new Error(`Failed to get site-packages location: ${error}`);
  }
}

const STORAGE_INSTALLED_KEY = 'installed_pythons';

export function removeSavedPython(pPath: string) {
  const savedInstallations: string[] | undefined = storageManager?.getCustomData(STORAGE_INSTALLED_KEY);

  if (!isNil(savedInstallations)) {
    storageManager?.setCustomRun(
      STORAGE_INSTALLED_KEY,
      savedInstallations.filter(p => p !== pPath),
    );
  }
}

export function addSavedPython(pPath: string) {
  const savedInstallations: string[] | undefined = storageManager?.getCustomData(STORAGE_INSTALLED_KEY);
  const paths = new Set<string>();

  if (!isNil(savedInstallations)) {
    savedInstallations.forEach(path => paths.add(path));
  }
  paths.add(pPath);

  storageManager?.setCustomRun(STORAGE_INSTALLED_KEY, Array.from(paths));
}

export default async function detectPythonInstallations(refresh: boolean): Promise<PythonInstallation[]> {
  const savedInstallations: string[] | undefined = storageManager?.getCustomData(STORAGE_INSTALLED_KEY);
  const paths = new Set<string>();

  if (!refresh && !isNil(savedInstallations) && !isEmpty(savedInstallations)) {
    savedInstallations.forEach(path => paths.add(path));
  } else {
    const pathSources = await Promise.all([await findPythonInPath(), await findInCommonLocations()]);

    pathSources.flat().forEach(path => paths.add(path));

    storageManager?.setCustomData(STORAGE_INSTALLED_KEY, Array.from(paths));
  }

  const installationPromises = Array.from(paths).map(async pythonPath => {
    try {
      const [
        version,
        isDefault,
        installationType,
        condaName,
        packages,
        architecture,
        pipPath,
        venvPaths,
        sitePackagesPath,
      ] = await Promise.all([
        (async () => await parseVersion(pythonPath))(),
        (async () => await isDefaultPython(pythonPath))(),
        (async () => await detectInstallationType(pythonPath))(),
        (async () => await getCondaEnvName(pythonPath))(),
        (async () => await getSitePackagesCount(pythonPath))(),
        (async () => await detectArchitecture(pythonPath))(),
        (async () => await getPipPath(pythonPath))(),
        (async () => await getVenvPaths(pythonPath))(),
        (async () => await getSitePackagesPath(pythonPath))(),
      ]);

      const installation: PythonInstallation = {
        version: `${version.major}.${version.minor}.${version.patch}`,
        packages,
        installationType,
        condaName,
        architecture,
        installPath: pythonPath,
        installFolder: dirname(pythonPath),
        pipPath,
        venvPaths,
        sitePackagesPath,
        isDefault,
      };

      return installation;
    } catch (error) {
      console.error(`Error analyzing Python installation at ${pythonPath}:`, error);
      return null;
    }
  });

  return compact(await Promise.all(installationPromises));
}
