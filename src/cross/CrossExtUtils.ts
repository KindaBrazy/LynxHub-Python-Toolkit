import semver from 'semver';

export function getUpdateType(currentVersion: string, updateVersion: string) {
  const currentVersionNormalized = semver.coerce(currentVersion)?.version;
  const updateVersionNormalized = semver.coerce(updateVersion)?.version;

  if (!currentVersionNormalized || !updateVersionNormalized) {
    console.warn(`Invalid version(s): current=${currentVersion}, update=${updateVersion}`);
    return null;
  }

  return semver.diff(currentVersionNormalized, updateVersionNormalized);
}

export function getUpdateVersionColor(currentVersion: string, updateVersion: string) {
  const updateType = getUpdateType(currentVersion, updateVersion);

  switch (updateType) {
    case 'prerelease':
      return 'text-blue-500';
    case 'major':
      return 'text-red-500';
    case 'minor':
      return 'text-yellow-500';
    case 'patch':
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
}

export function formatSizeMB(mb: number): number | string {
  if (mb > 1024) {
    return (mb / 1024).toFixed(2) + ' GB';
  } else {
    return mb + ' MB';
  }
}

export function bytesToMegabytes(bytes: number): number {
  if (bytes < 0) {
    throw new Error('Bytes value cannot be negative');
  }
  const megabytes = bytes / (1024 * 1024);
  return parseFloat(megabytes.toFixed(2)); // Rounded to 2 decimal places
}

export function replacePythonPath(envPath: string, newPythonBase: string): string {
  // Normalize slashes and remove trailing slash
  const normalizedNewPython = newPythonBase.replace(/\\/g, '/').replace(/\/+$/, '');

  // Split PATH into individual entries
  const pathEntries = envPath
    .split(/;|:/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  // Filter out old Python paths
  const filtered = pathEntries.filter(p => {
    const normP = p.replace(/\\/g, '/');
    return (
      !/python\d*\.?\d*\/?$/i.test(normP) && // python folder
      !/python\d*\.?\d*\/scripts\/?$/i.test(normP) // scripts folder
    );
  });

  // Add new Python paths at the start (or end if you want)
  filtered.unshift(normalizedNewPython, `${normalizedNewPython}/Scripts`);

  // Join back into PATH string
  return filtered.join(';');
}
