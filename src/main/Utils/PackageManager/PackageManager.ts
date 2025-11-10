import {ChildProcess, exec} from 'node:child_process';

import {PackageUpdate, SitePackages_Info} from '../../../cross/CrossExtTypes';

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

// Module-level variable to hold the ongoing update process
let updateProcess: ChildProcess | null = null;

export async function updatePackages(pythonExePath: string, packages: PackageUpdate[]): Promise<string> {
  return new Promise((resolve, reject) => {
    if (updateProcess) {
      reject(new Error('Another package update is already in progress.'));
      return;
    }

    if (packages.length === 0) {
      resolve('No packages selected for update.');
      return;
    }

    const packageSpecs = packages
      .map(pkg => (pkg.targetVersion ? `${pkg.name}==${pkg.targetVersion}` : pkg.name))
      .join(' ');

    const updateCommand = `"${pythonExePath}" -m pip install --upgrade ${packageSpecs}`;
    console.log(`Executing: ${updateCommand}`); // Good for debugging

    updateProcess = exec(updateCommand, (updateError, updateStdout, updateStderr) => {
      updateProcess = null;

      if (updateError) {
        if (updateError.killed) {
          reject(new Error('Package update was cancelled.'));
          return;
        }
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

// Cancels the ongoing package update process, if any.
export function abortOngoingUpdate(): void {
  if (updateProcess) {
    updateProcess.kill();
    console.log('Cancellation signal sent to package update process.');
  } else {
    console.log('No ongoing package update to cancel.');
  }
}
