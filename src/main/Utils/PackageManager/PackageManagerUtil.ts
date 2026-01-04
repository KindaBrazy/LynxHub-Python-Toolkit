import {exec} from 'child_process';
import {isNil} from 'lodash';
import semver from 'semver';

interface PackageInfo {
  packageName: string;
  currentVersion: string;
  targetVersion: string;
}

export async function changePythonPackageVersion(
  pythonPath: string,
  packageName: string,
  cVersion: string,
  tVersion: string,
): Promise<void> {
  const currentVersion = semver.coerce(cVersion)?.version;
  const targetVersion = semver.coerce(tVersion)?.version;

  return new Promise<void>((resolve, reject) => {
    if (isNil(currentVersion) || isNil(targetVersion)) {
      reject('Invalid current or target version provided');
      return;
    }

    if (!semver.valid(currentVersion)) {
      reject(`Invalid current version provided: ${currentVersion}. Please use a valid semantic version.`);
      return;
    }

    if (!semver.valid(targetVersion)) {
      reject(`Invalid target version provided: ${targetVersion}. Please use a valid semantic version.`);
      return;
    }

    const packageInfo: PackageInfo = {
      packageName,
      currentVersion,
      targetVersion,
    };

    const changeVersionCommand = constructChangeVersionCommand(pythonPath, packageInfo);

    exec(changeVersionCommand, (error, stdout, stderr) => {
      if (error) {
        reject(`Error changing version of ${packageName}: ${error.message}`);
        return;
      }

      console.log(stdout);
      if (stderr) {
        console.error(stderr);
      }

      console.log(`Successfully changed ${packageName} to version ${targetVersion}`);
      resolve();
    });
  });
}

function constructChangeVersionCommand(pythonExePath: string, packageInfo: PackageInfo): string {
  const {packageName, currentVersion, targetVersion} = packageInfo;
  const isInstall = !currentVersion;
  const isUpgrade = !isInstall && semver.gt(targetVersion, currentVersion);

  let command = `"${pythonExePath}" -m pip install`;

  if (!isInstall) {
    command += ` --force-reinstall`;
  }

  if (isUpgrade) {
    command += ` --upgrade`;
  }

  command += ` ${packageName}==${targetVersion}`;
  return command;
}
