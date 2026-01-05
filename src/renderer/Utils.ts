import {gte} from 'semver';

export const cacheUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  return gte(window.lynxVersion || '3.3.0', '3.4.0') ? `lynxcache://fetch/${encodeURIComponent(url)}` : url;
};
