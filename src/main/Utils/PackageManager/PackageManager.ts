import {exec} from 'node:child_process';

import {compact} from 'lodash';
import semver, {compare} from 'semver';

import {PackageInfo, PackageUpdate, SitePackages_Info} from '../../../cross/CrossExtTypes';
import {getLatestPipPackageVersion} from './PipToolsManager';

export async function getSitePackagesInfo(pythonExePath: string): Promise<SitePackages_Info[]> {
  return new Promise((resolve, reject) => {
    const command = `"${pythonExePath}" -m pip list --format json`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error getting site packages: ${error.message}`);
        return;
      }
      if (stderr) {
        console.warn(`stderr when getting site packages: ${stderr}`);
      }

      try {
        const packages: {name: string; version: string}[] = JSON.parse(stdout);
        const packagePromises: SitePackages_Info[] = packages.map(pkg => {
          return {name: pkg.name, version: pkg.version};
        });

        resolve(packagePromises);
      } catch (parseError) {
        reject(`Error parsing pip output: ${parseError}`);
      }
    });
  });
}

// TODO: add MaxRetry_StorageID for this
export async function getSitePackagesUpdates(packages: PackageInfo[]): Promise<SitePackages_Info[]> {
  try {
    const getLatest = packages.map(async pkg => {
      try {
        const latestVersion = await getLatestPipPackageVersion(pkg.name);
        const currentVersion = semver.coerce(pkg.version)?.version;

        if (!latestVersion || !currentVersion || compare(currentVersion, latestVersion) !== -1) return null;

        return {name: pkg.name, version: latestVersion};
      } catch (e) {
        return null;
      }
    });

    return compact(await Promise.all(getLatest));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function installPythonPackage(pythonExePath: string, commands: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const command = `${pythonExePath} -m pip install ${commands} --disable-pip-version-check`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Error installing package: ${error.message}\nStderr: ${stderr}`));
        return;
      }

      if (stderr) {
        console.warn(`pip stderr: ${stderr}`);
      }

      resolve(stdout);
    });
  });
}

export async function updatePythonPackage(
  pythonExePath: string,
  packageName: string,
  version?: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const packageSpecifier = version ? `${packageName}==${version}` : packageName;

    const command = `"${pythonExePath}" -m pip install --upgrade "${packageSpecifier}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error updating package ${packageName}: ${error.message}\nstderr: ${stderr}`);
        return;
      }

      resolve(stdout);
    });
  });
}

export async function updateAllPythonPackages(pythonExePath: string, packages: PackageUpdate[]): Promise<string> {
  return new Promise((resolve, reject) => {
    if (packages.length === 0) {
      resolve('No packages selected for update.');
      return;
    }

    const packageSpecs = packages
      .map(pkg => (pkg.targetVersion ? `${pkg.name}==${pkg.targetVersion}` : pkg.name))
      .join(' ');

    const updateCommand = `"${pythonExePath}" -m pip install --upgrade ${packageSpecs}`;
    console.log(`Executing: ${updateCommand}`); // Good for debugging

    exec(updateCommand, (updateError, updateStdout, updateStderr) => {
      if (updateError) {
        // Provide a more detailed error message
        const errorMessage = `Error updating packages.
        Command: ${updateCommand}
        Error: ${updateError.message}
        Stderr: ${updateStderr}`;

        reject(new Error(errorMessage));
        return;
      }

      resolve(updateStdout);
    });
  });
}

export async function uninstallPythonPackage(pythonExePath: string, packageName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const command = `"${pythonExePath}" -m pip uninstall -y "${packageName}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error uninstalling package ${packageName}: ${error.message}\nstderr: ${stderr}`);
        return;
      }

      resolve(stdout);
    });
  });
}
