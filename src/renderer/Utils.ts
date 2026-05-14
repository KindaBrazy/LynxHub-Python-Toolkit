import {gte} from 'semver';

export const cacheUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  return gte(window.lynxVersion || '3.3.0', '3.4.0') ? `lynxcache://fetch/${encodeURIComponent(url)}` : url;
};

export function getUniqueLabels(dirs: string[]): string[] {
  // Normalize paths: backslashes to forward slashes, remove trailing slashes
  const normalized = dirs.map(dir => dir.replace(/\\/g, '/').replace(/\/$/, ''));

  // Split into segments and reverse (start from the end)
  const segments = normalized.map(path => path.split('/').reverse());

  // Start with only the last segment for each
  const parts = segments.map(segs => [segs[0]]);

  // Keep extending duplicates until all labels are unique
  let changed = true;
  while (changed) {
    changed = false;
    const groups = new Map<string, number[]>();

    // Group by current label
    parts.forEach((p, i) => {
      const label = p.join(' -> ');
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label)!.push(i);
    });

    // Extend any group that has more than one item
    for (const indices of groups.values()) {
      if (indices.length > 1) {
        for (const idx of indices) {
          const segs = segments[idx];
          if (parts[idx].length < segs.length) {
            // Prepend the next segment
            parts[idx] = [segs[parts[idx].length], ...parts[idx]];
            changed = true;
          }
        }
      }
    }
  }

  // Join parts back with arrow
  return parts.map(p => p.join(' | '));
}
