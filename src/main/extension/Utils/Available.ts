import {platform} from 'node:os';

import {PythonVersion} from '../../../cross/CrossExtensions';

function removeDuplicateUrls(versions: PythonVersion[]): PythonVersion[] {
  const seenUrls = new Set();
  return versions.filter(version => {
    if (seenUrls.has(version.url)) {
      return false;
    } else {
      seenUrls.add(version.url);
      return true;
    }
  });
}

export async function getAvailablePythonVersions(): Promise<PythonVersion[]> {
  try {
    const response = await fetch('https://www.python.org/downloads/');
    const text = await response.text();

    // Extract version numbers using regex
    const versionRegex = /Python\s+(\d+\.\d+\.\d+)/g;
    const matches = [...text.matchAll(versionRegex)];

    // Create download URLs
    const result = matches.map(match => ({
      version: match[1],
      url: getPythonDownloadUrl(match[1]),
    }));

    // Filter out versions with non-existent download URLs
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

    // Remove duplicates and return
    return removeDuplicateUrls(validVersions.filter((v): v is PythonVersion => v !== null));
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
    case 'darwin':
      return `${baseUrl}/${version}/python-${version}-macos11.pkg`;
    default:
      return `${baseUrl}/${version}/Python-${version}.tgz`;
  }
}
