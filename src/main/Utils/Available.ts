import {arch, platform} from 'node:os';

import {exec} from 'child_process';
import {promisify} from 'util';

import {PythonVersion} from '../../cross/CrossExtTypes';

const execAsync = promisify(exec);

/** Checks if running on Apple Silicon (arm64) Mac */
function isAppleSilicon(): boolean {
  return platform() === 'darwin' && arch() === 'arm64';
}

function removeDuplicateUrls(versions: PythonVersion[]): PythonVersion[] {
  const seenUrls = new Set();
  return versions
    .filter(version => {
      if (seenUrls.has(version.url) || version.version.startsWith('2')) {
        return false;
      } else {
        seenUrls.add(version.url);
        return true;
      }
    })
    .sort((a, b) => {
      const aParts = a.version.split('.').map(Number);
      const bParts = b.version.split('.').map(Number);

      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aPart = aParts[i] || 0;
        const bPart = bParts[i] || 0;

        if (aPart !== bPart) {
          return bPart - aPart;
        }
      }

      return 0;
    });
}

/**
 * Checks if `software-properties-common` is installed using `apt-cache policy`.
 * If not installed, installs it using `pkexec`.
 * Throws an error if installation fails.
 */
async function ensureSoftwarePropertiesCommon(): Promise<void> {
  try {
    const {stdout} = await execAsync('apt-cache policy software-properties-common');
    if (!stdout.includes('Installed: (none)')) {
      return;
    }

    const {stderr} = await execAsync('pkexec apt install -y software-properties-common');
    if (stderr) {
      throw new Error(`Failed to install software-properties-common: ${stderr}`);
    }
  } catch (err: any) {
    throw new Error(`Error ensuring software-properties-common is installed: ${err.message}`);
  }
}

/**
 * Adds the Deadsnakes PPA if it doesn't already exist.
 */
async function ensureDeadsnakesPPA(): Promise<void> {
  try {
    const {stdout} = await execAsync('apt-cache policy | grep deadsnakes');
    if (stdout.includes('deadsnakes')) {
      return;
    }

    await execAsync('pkexec add-apt-repository -y ppa:deadsnakes/ppa');

    await execAsync('pkexec apt update');
  } catch (err: any) {
    throw new Error(`Error ensuring Deadsnakes PPA is added: ${err.message}`);
  }
}

export async function getAvailablePythonVersions(): Promise<PythonVersion[]> {
  try {
    if (platform() === 'win32') {
      const response = await fetch('https://www.python.org/downloads/');
      const text = await response.text();

      const versionRegex = /Python\s+(\d+\.\d+\.\d+)/g;
      const matches = [...text.matchAll(versionRegex)];

      const result = matches.map(match => ({
        version: match[1],
        url: getPythonDownloadUrl(match[1]),
      }));

      const validVersions = await Promise.all(
        result.map(async version => {
          try {
            const response = await fetch(version.url, {method: 'HEAD'});
            return response.ok ? version : null;
          } catch {
            return null;
          }
        }),
      );

      return removeDuplicateUrls(validVersions.filter((v): v is PythonVersion => v !== null));
    } else if (platform() === 'linux') {
      await ensureSoftwarePropertiesCommon();
      await ensureDeadsnakesPPA();

      // Fetch available Python versions from the PPA
      const {stdout} = await execAsync('apt-cache search ^python3\\.[0-9]+$');
      const versions = stdout
        .split('\n')
        .filter(line => line.startsWith('python3'))
        .map(line => line.split(' ')[0].replace('python', ''))
        .map(version => ({version, url: getPythonDownloadUrl(version)}));

      return removeDuplicateUrls(versions);
    } else if (platform() === 'darwin') {
      // macOS: Fetch available versions from python.org (same as Windows)
      const response = await fetch('https://www.python.org/downloads/');
      const text = await response.text();

      const versionRegex = /Python\s+(\d+\.\d+\.\d+)/g;
      const matches = [...text.matchAll(versionRegex)];

      const result = matches.map(match => ({
        version: match[1],
        url: getPythonDownloadUrl(match[1]),
      }));

      // Validate URLs exist (macOS universal2 packages available from Python 3.9.1+)
      const validVersions = await Promise.all(
        result.map(async version => {
          try {
            const response = await fetch(version.url, {method: 'HEAD'});
            return response.ok ? version : null;
          } catch {
            return null;
          }
        }),
      );

      return removeDuplicateUrls(validVersions.filter((v): v is PythonVersion => v !== null));
    } else {
      return [];
    }
  } catch (error: any) {
    throw new Error(`Failed to fetch Python versions: ${error.message}`);
  }
}

function getPythonDownloadUrl(version: string): string {
  const baseUrl = 'https://www.python.org/ftp/python';

  switch (platform()) {
    case 'win32':
      return version.startsWith('2')
        ? `${baseUrl}/${version}/python-${version}.amd64.msi`
        : `${baseUrl}/${version}/python-${version}-amd64.exe`;
    case 'linux':
      return `https://launchpad.net/~deadsnakes/+archive/ubuntu/ppa/+packages?field.name_filter=python${version}`;
    case 'darwin': {
      // Python 3.9.1+ provides universal2 packages (works on both Intel and Apple Silicon)
      // For older versions, fall back to macos11.pkg (Intel only)
      const [major, minor, patch] = version.split('.').map(Number);
      const hasUniversal2 = major >= 3 && (minor > 9 || (minor === 9 && patch >= 1));
      return hasUniversal2
        ? `${baseUrl}/${version}/python-${version}-macos11.pkg`
        : `${baseUrl}/${version}/python-${version}-macosx10.9.pkg`;
    }
    default:
      return `${baseUrl}/${version}/python-${version}-macos11.pkg`;
  }
}
