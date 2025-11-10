import {exec} from 'node:child_process';

import {SitePackages_Info} from '../../../cross/CrossExtTypes';

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
