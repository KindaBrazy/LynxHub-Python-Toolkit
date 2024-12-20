import {exec} from 'node:child_process';
import {promisify} from 'node:util';

import {satisfies} from 'semver';

import {SitePackages_Info} from '../../../../cross/CrossExtensions';
import {readRequirements} from '../Requirements/PythonRequirements';

const execAsync = promisify(exec);

async function getLatestVersion(pythonPath: string, name: string) {
  let latestVersion: string;

  try {
    // Get the latest version
    const latestVersionResult = await execAsync(
      `${pythonPath} -m pip install ${name}==random --disable-pip-version-check`,
      {
        encoding: 'utf-8',
      },
    );

    latestVersion = latestVersionResult.stderr;
    const startOfVersion = latestVersion.indexOf('(from versions:');
    if (startOfVersion === -1) {
      throw new Error(`Could not parse latest version output: ${latestVersion}`);
    }
    latestVersion = latestVersion.substring(startOfVersion + 15);
    latestVersion = latestVersion.substring(0, latestVersion.indexOf(')'));
    latestVersion = latestVersion.replace(/\s/g, '').split(',').pop() || '';

    return latestVersion;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Could not find a version')) {
      const errorOutput = error.message;
      const startOfVersion = errorOutput.indexOf('(from versions:');
      if (startOfVersion === -1) {
        console.error(`Error parsing latest version from error message:`, error);
        return false;
      }
      latestVersion = errorOutput.substring(startOfVersion + 15);
      latestVersion = latestVersion.substring(0, latestVersion.indexOf(')'));
      latestVersion = latestVersion.replace(/\s/g, '').split(',').pop() || '';

      return latestVersion;
    } else {
      console.error(`Unexpected error getting latest version for ${name}:`, error);
      return false;
    }
  }
}

export async function checkPackageUpdates(
  pythonPath: string,
  reqPath: string,
  currentPackages: SitePackages_Info[],
): Promise<SitePackages_Info[]> {
  const result: SitePackages_Info[] = [];
  const reqData = await readRequirements(reqPath);

  for (const req of reqData) {
    if (req.versionOperator === '==' || req.versionOperator?.includes('<')) continue;

    const latestVersion = await getLatestVersion(pythonPath, req.name);
    const currentVersion = currentPackages.find(item => item.name === req.name)?.version;

    if (!latestVersion || !currentPackages) continue;

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

    if (canUpdate && latestVersion !== currentVersion) result.push({name: req.name, version: latestVersion});
  }

  return result;
}
