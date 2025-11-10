import axios from 'axios';
import {compact} from 'lodash';
import semver, {compare, lt, satisfies} from 'semver';

import {MaxConcurrent_StorageID, MaxRetry_StorageID} from '../../../cross/CrossExtConstants';
import {PackageInfo, pythonChannels, SitePackages_Info} from '../../../cross/CrossExtTypes';
import {getAppManager, getStorage} from '../../DataHolder';
import {readRequirements} from '../Requirements/PythonRequirements';

let currentUpdateController: AbortController | null = null;

/**
 * Executes an array of promise-returning functions with a specified concurrency limit.
 * @param tasks An array of functions, where each function returns a promise.
 * @param limit The maximum number of promises to execute concurrently. If 0 or invalid, no limit is applied.
 * @param signal An AbortSignal to cancel ongoing operations.
 * @returns A promise that resolves with an array of results in the same order as the input tasks.
 */
async function runWithConcurrencyLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
  signal?: AbortSignal,
): Promise<T[]> {
  if (!limit || limit <= 0) {
    const promises = tasks.map(task => task());
    return Promise.all(promises);
  }

  const results: T[] = new Array(tasks.length);

  const taskQueue = tasks.map((task, index) => ({task, index}));

  const workers = Array(limit)
    .fill(null)
    .map(async () => {
      while (taskQueue.length > 0) {
        if (signal?.aborted) {
          return;
        }

        const nextTask = taskQueue.shift();
        if (nextTask) {
          const {task, index} = nextTask;

          const result = await task();
          results[index] = result;
        }
      }
    });

  await Promise.all(workers);

  return results;
}

export function cancelPackagesUpdateCheck() {
  if (currentUpdateController) {
    console.log('Cancelling ongoing package update check...');
    currentUpdateController.abort();
    currentUpdateController = null;
  }
}

export async function getLatestPipPackageVersion(
  packageName: string,
  maxRetries: number = 5,
  signal?: AbortSignal,
): Promise<string | null> {
  const url = `https://pypi.org/pypi/${packageName}/json`;
  const window = getAppManager()?.getMainWindow();

  try {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.get(url, {timeout: 15000, signal});
        const data = response.data;
        if (data?.info?.version) {
          return semver.coerce(data.info.version)?.version || null;
        } else {
          console.error(`Could not find version information for ${packageName} in the response.`);
          return null;
        }
      } catch (error: any) {
        if (axios.isCancel(error)) {
          return null;
        }

        if (attempt === maxRetries) {
          if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
              console.error(`Package ${packageName} not found on PyPI after ${maxRetries} attempts.`);
            } else {
              console.error(
                `Error fetching package info for ${packageName} after ${maxRetries} attempts:`,
                error.message,
              );
            }
          } else {
            console.error(`An unexpected error occurred for ${packageName} after ${maxRetries} attempts:`, error);
          }

          break;
        }

        const delay = Math.pow(2, attempt) * 100;
        await new Promise(res => setTimeout(res, delay));
      }
    }

    return null;
  } finally {
    if (window && !signal?.aborted) {
      window.webContents.send(pythonChannels.updateCheckProgress, packageName);
    }
  }
}

export async function getPipPackageAllVersions(packageName: string): Promise<string[] | null> {
  const url = `https://pypi.org/pypi/${packageName}/json`;

  try {
    const response = await axios.get(url, {timeout: 15000});
    const data = response.data;

    if (data?.releases) {
      const versions = Object.keys(data.releases);

      // Filter out versions that don't have any files (usually yanked versions)
      const validVersions = versions.filter(version => data.releases[version].length > 0);

      const semverVersions = validVersions
        .map(v => semver.coerce(v)?.version)
        .filter((v): v is string => v !== null && v !== undefined);

      const versionsToSort = semverVersions.length > 0 ? semverVersions : validVersions;

      return versionsToSort.sort((a, b) => semver.rcompare(a, b));
    } else {
      console.error(`Could not find releases information for ${packageName} in the response.`);
      return null;
    }
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        console.error(`Package ${packageName} not found on PyPI.`);
      } else {
        console.error(`Error fetching package info for ${packageName}:`, error.message);
      }
    } else {
      console.error(`An unexpected error occurred for ${packageName}:`, error);
    }

    return null;
  }
}

export async function getPackagesUpdateByReq(
  reqPath: string,
  packages: SitePackages_Info[],
): Promise<SitePackages_Info[]> {
  cancelPackagesUpdateCheck();
  currentUpdateController = new AbortController();
  const signal = currentUpdateController.signal;

  try {
    const maxRetriesConfig = getStorage()?.getCustomData(MaxRetry_StorageID) as number | undefined;
    const maxConcurrentConfig = getStorage()?.getCustomData(MaxConcurrent_StorageID) as number | undefined;

    const reqData = await readRequirements(reqPath);

    const tasks = reqData.map(req => {
      return async (): Promise<SitePackages_Info | null> => {
        if (signal.aborted) return null;

        const targetInPackage = packages.find(
          item => item.name.toLowerCase().replaceAll('_', '-') === req.name.toLowerCase().replaceAll('_', '-'),
        );

        const latestVersion = await getLatestPipPackageVersion(req.name, maxRetriesConfig, signal);
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
      };
    });

    const results = await runWithConcurrencyLimit(tasks, maxConcurrentConfig || 0, signal);

    return compact(results);
  } finally {
    currentUpdateController = null;
  }
}

export async function getPackagesUpdate(packages: PackageInfo[]): Promise<SitePackages_Info[]> {
  cancelPackagesUpdateCheck();
  currentUpdateController = new AbortController();
  const signal = currentUpdateController.signal;

  try {
    const maxRetriesConfig = getStorage()?.getCustomData(MaxRetry_StorageID) as number | undefined;
    const maxConcurrentConfig = getStorage()?.getCustomData(MaxConcurrent_StorageID) as number | undefined;

    const tasks = packages.map(pkg => {
      return async (): Promise<SitePackages_Info | null> => {
        try {
          if (signal.aborted) return null;

          const latestVersion = await getLatestPipPackageVersion(pkg.name, maxRetriesConfig, signal);
          const currentVersion = semver.coerce(pkg.version)?.version;

          if (!latestVersion || !currentVersion || compare(currentVersion, latestVersion) !== -1) return null;

          return {name: pkg.name, version: latestVersion};
        } catch (e) {
          return null;
        }
      };
    });

    const results = await runWithConcurrencyLimit(tasks, maxConcurrentConfig || 0, signal);

    return compact(results);
  } catch (e) {
    console.error(e);
    return [];
  } finally {
    currentUpdateController = null;
  }
}
