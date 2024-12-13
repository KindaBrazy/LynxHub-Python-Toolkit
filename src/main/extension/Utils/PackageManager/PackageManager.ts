import {exec} from 'node:child_process';

import {SitePackages_Info} from '../../../../cross/CrossExtensions';

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

export async function getSitePackagesUpdates(pythonExePath: string): Promise<SitePackages_Info[]> {
  return new Promise((resolve, reject) => {
    const command = `"${pythonExePath}" -m pip list --format json --outdated`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error getting site packages: ${error.message}`);
        return;
      }
      if (stderr) {
        console.warn(`stderr when getting site packages: ${stderr}`);
      }

      try {
        const packages: {name: string; version: string; latest_version: string}[] = JSON.parse(stdout);
        const packagePromises: SitePackages_Info[] = packages.map(pkg => {
          return {name: pkg.name, version: pkg.latest_version};
        });

        resolve(packagePromises);
      } catch (parseError) {
        reject(`Error parsing pip output: ${parseError}`);
      }
    });
  });
}

/**
 * Updates a specified Python package using pip.
 *
 * @param {string} pythonExePath - The full path to the Python executable
 * @param {string} packageName - The name of the Python package to update (e.g., "requests" or "numpy").
 * @returns {Promise<string>} - A promise that resolves with the output of the pip command or rejects with an error.
 */
export async function updatePythonPackage(pythonExePath: string, packageName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Construct the pip command.
    const command = `"${pythonExePath}" -m pip install --upgrade "${packageName}"`;

    // Execute the command.
    exec(command, (error, stdout, stderr) => {
      if (error) {
        // If there's an error, reject the promise with the error details.
        reject(`Error updating package ${packageName}: ${error.message}\nstderr: ${stderr}`);
        return;
      }

      // If the command was successful, resolve the promise with the output.
      resolve(stdout);
    });
  });
}
