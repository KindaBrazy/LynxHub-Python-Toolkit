import axios from 'axios';
import {compact} from 'lodash';
import semver, {lt, satisfies} from 'semver';

import {SitePackages_Info} from '../../../cross/CrossExtTypes';
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
    const targetInPackage = packages.find(
      item => item.name.toLowerCase().replaceAll('_', '-') === req.name.toLowerCase().replaceAll('_', '-'),
    );

    const latestVersion = await getLatestPipPackageVersion(req.name);
    const reqVersion = targetInPackage?.version;
    const currentVersion = semver.coerce(reqVersion)?.version;

    if (!latestVersion || !packages || !currentVersion) return null;

    let canUpdate: boolean = false;
    let targetVersion: string = currentVersion || '';

    switch (req.versionOperator) {
      case '>=':
      case '>':
      case '!=':
        if (!req.version) break;

        canUpdate = satisfies(latestVersion, `${req.versionOperator}${req.version}`);
        if (canUpdate) targetVersion = latestVersion;

        break;
      case '<':
      case '<=': {
        if (!req.version) break;

        canUpdate = lt(currentVersion, req.version);
        if (canUpdate) targetVersion = req.version;

        break;
      }
      case '==': {
        if (!req.version) break;

        canUpdate = currentVersion !== req.version;
        if (canUpdate) targetVersion = req.version;

        break;
      }
      case '~=': {
        if (!req.version) break;
        const latestParts = latestVersion.split('.');
        const reqParts = req.version.split('.');
        canUpdate = latestParts[0] === reqParts[0] && satisfies(latestVersion, `>${req.version}`);
        targetVersion = latestVersion;
        break;
      }
      default:
        // console.warn(`Unsupported operator: ${req.versionOperator}`);
        canUpdate = true;
        targetVersion = latestVersion;
    }

    if (canUpdate && targetVersion !== currentVersion)
      return {name: targetInPackage?.name || req.name, version: targetVersion};

    return null;
  });

  return compact(await Promise.all(result));
}
