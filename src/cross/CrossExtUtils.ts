import semver from 'semver';

import {RequirementData} from './CrossExtTypes';

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

// Wheel filename format: {name}-{version}(-{build})?-{python}-{abi}-{platform}.whl
// e.g. gradio_client-1.0.2+custom.1-py3-none-any.whl
function parseWheelFilename(filename: string): {name: string; version: string} | null {
  // Match distribution name (first segment) and version (second segment, allowing PEP 440 local versions like +cu124)
  const match = filename.match(/^([A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?)-([^-]+(?:\+[^-]+)?)/);
  if (!match) return null;
  return {
    // Normalize underscores/dots to hyphens per PEP 503
    name: match[1].replace(/[-_.]+/g, '-'),
    version: match[2],
  };
}

export function parseRequirementLine(line: string): RequirementData {
  const originalLine = line.trim();

  // ── URL-based requirement ──────────────────────────────────────────────────
  // Matches bare URLs or PEP 440 direct references:  pkg @ https://...
  const isDirectUrl = /^https?:\/\//i.test(originalLine);
  const isAtUrl = /\s@\s+https?:\/\//i.test(originalLine);

  if (isDirectUrl || isAtUrl) {
    let url: string;
    let markers: string | null = null;
    let name: string = originalLine;
    let version: string | null = null;

    if (isAtUrl) {
      // "package @ https://..." — name is before the @
      const atMatch = originalLine.match(
        /^([A-Za-z0-9][A-Za-z0-9._-]*)\s*@\s*(https?:\/\/\S+?)(?:\s*;\s*(.+?))?(?:\s*#.*)?$/i,
      );
      if (atMatch) {
        name = atMatch[1].replace(/[-_.]+/g, '-');
        url = atMatch[2];
        markers = atMatch[3]?.trim() ?? null;
      } else {
        url = originalLine;
      }
    } else {
      // Bare URL, possibly with "; marker" suffix
      const urlMarkerMatch = originalLine.match(/^(https?:\/\/\S+?)(?:\s*;\s*(.+?))?(?:\s*#.*)?$/i);
      url = urlMarkerMatch ? urlMarkerMatch[1] : originalLine;
      markers = urlMarkerMatch?.[2]?.trim() ?? null;
    }

    // Try to extract name + version from .whl filename
    const filename = url.split('/').pop() ?? '';
    if (filename.endsWith('.whl')) {
      const parsed = parseWheelFilename(filename);
      if (parsed) {
        name = parsed.name;
        version = parsed.version;
      }
    }

    return {name, versionOperator: null, version, originalLine, url, markers};
  }

  // ── Regular requirement ────────────────────────────────────────────────────
  let working = originalLine;

  // 1. Strip inline comment (only after whitespace to avoid false positives)
  working = working.replace(/\s+#.*$/, '');

  // 2. Split off environment markers  (e.g. "; python_version >= '3.8'")
  let markers: string | null = null;
  const semiIdx = working.indexOf(';');
  if (semiIdx !== -1) {
    markers = working.slice(semiIdx + 1).trim() || null;
    working = working.slice(0, semiIdx).trim();
  }

  // 3. Extract extras  (e.g. "requests[security,socks]")
  let extras: string[] | null = null;
  const extrasMatch = working.match(/^([^[]+)\[([^\]]+)](.*)/);
  if (extrasMatch) {
    extras = extrasMatch[2].split(',').map(e => e.trim());
    working = extrasMatch[1] + extrasMatch[3]; // remove [extras] block
  }

  // 4. Parse version specifier  (supports !=, ~=, ===, and multiple specifiers)
  const versionMatch = working.match(/(===|~=|==|!=|>=|<=|>|<)\s*([^\s,]+)/);
  const versionOperator = versionMatch?.[1] ?? null;
  const version = versionMatch?.[2] ?? null;

  // 5. Package name is everything before the first operator
  const namePart = working.split(/===|~=|==|!=|>=|<=|>|</)[0].trim();
  // Normalize to canonical form
  const name = namePart.replace(/[-_.]+/g, '-');

  return {name, versionOperator, version, originalLine, extras, markers};
}
