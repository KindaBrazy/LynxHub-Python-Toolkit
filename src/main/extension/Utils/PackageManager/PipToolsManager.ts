import axios from 'axios';
import {compact} from 'lodash';
import semver, {satisfies} from 'semver';

import {SitePackages_Info} from '../../../../cross/extension/CrossExtTypes';
import {readRequirements} from '../Requirements/PythonRequirements';

/** @todo Add settings menu for retry option */
export async function getLatestPipPackageVersion(packageName: string): Promise<string | null> {
  const url = `https://pypi.org/pypi/${packageName}/json`;
  const maxRetries = 2;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const response = await axios.get(url);
      const data = response.data;
      if (data && data.info && data.info.version) {
        return semver.coerce(data.info.version)?.version || null;
      } else {
        console.error(`Could not find version information for ${packageName} in the response.`);
        return null;
      }
    } catch (error: any) {
      attempt++;
      if (attempt > maxRetries) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            console.error(`Package ${packageName} not found on PyPI.`);
          } else {
            console.error(`Error fetching package information for ${packageName}:`, error.message);
          }
        } else {
          console.error(`An unexpected error occurred while fetching package information:`, error);
        }
        return null;
      }
    }
  }

  return null; // This line is technically unreachable, but TypeScript requires it.
}

export async function checkPackageUpdates(
  reqPath: string,
  packages: SitePackages_Info[],
): Promise<SitePackages_Info[]> {
  const reqData = await readRequirements(reqPath);

  const result = reqData.map(async req => {
    if (req.versionOperator === '==' || req.versionOperator?.includes('<')) return null;

    const latestVersion = await getLatestPipPackageVersion(req.name);
    const reqVersion = packages.find(item => item.name === req.name)?.version;
    const currentVersion = semver.coerce(reqVersion)?.version;

    if (!latestVersion || !packages || !currentVersion) return null;

    let canUpdate: boolean = false;

    switch (req.versionOperator) {
      case '>=':
      case '>':
      case '!=':
        canUpdate = satisfies(latestVersion, `${req.versionOperator}${req.version}`);
        break;
      case '~=': {
        if (!req.version) break;
        const latestParts = latestVersion.split('.');
        const reqParts = req.version.split('.');
        canUpdate = latestParts[0] === reqParts[0] && satisfies(latestVersion, `>${req.version}`);
        break;
      }
      default:
        // console.warn(`Unsupported operator: ${req.versionOperator}`);
        canUpdate = true;
    }

    if (canUpdate && latestVersion !== currentVersion) return {name: req.name, version: latestVersion};

    return null;
  });

  const j = compact(await Promise.all(result));

  return j;
}
