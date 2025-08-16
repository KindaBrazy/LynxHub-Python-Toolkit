import {join} from 'node:path';

import {exec} from 'child_process';
import {compact, filter, isEmpty, isNil} from 'lodash';

import {pythonChannels, VenvCreateOptions, VenvInfo} from '../../../cross/CrossExtTypes';
import {appManager, storageManager} from '../../lynxExtension';
import {openDialogExt} from '../PythonUtils';
import {getVenvInfo, isVenvDirectory} from './VenvUtils';

const STORE_VENVS_ID = 'python-venvs-locations';

function validateVenvs() {
  const venvs = storageManager?.getCustomData(STORE_VENVS_ID) as string[] | null;

  let validEnvs: string[];

  if (isNil(venvs)) {
    validEnvs = [];
  } else {
    validEnvs = filter(venvs, isVenvDirectory);
  }

  storageManager?.setCustomData(STORE_VENVS_ID, validEnvs);

  return validEnvs;
}

export function updateVenvStorage(newVenvPath: string) {
  const existVenvs = storageManager?.getCustomData(STORE_VENVS_ID) as string[];

  if (isEmpty(existVenvs)) {
    storageManager?.setCustomData(STORE_VENVS_ID, [newVenvPath]);
  } else {
    const newVenvs = new Set([...existVenvs, newVenvPath]);
    storageManager?.setCustomData(STORE_VENVS_ID, Array.from(newVenvs));
  }
}

function removeVenvStorage(venvPath: string) {
  const existVenvs = storageManager?.getCustomData(STORE_VENVS_ID) as string[];
  if (existVenvs) {
    storageManager?.setCustomData(STORE_VENVS_ID, Array.from(existVenvs.filter(venv => venv !== venvPath)));
  }
}

export async function getVenvs() {
  const venvs = validateVenvs();
  const window = appManager?.getMainWindow();
  if (!window) {
    throw new Error('getVenvs: No window found');
  }

  const venvsInfo: (VenvInfo | null)[] = [];

  for (const venv of venvs) {
    try {
      const info = await getVenvInfo(venv);
      venvsInfo.push(info);
    } catch (e) {
      if (window) {
        window.webContents.send(pythonChannels.errorGetVenvInfo, e);
        removeVenvStorage(venv);
      }
      continue;
    }
  }

  return compact(venvsInfo);
}

export async function locateVenv() {
  try {
    const selectedFolder = await openDialogExt({properties: ['openDirectory']});

    if (!selectedFolder) {
      return false;
    }
    const isVenv = isVenvDirectory(selectedFolder);

    if (isVenv) updateVenvStorage(selectedFolder);

    return isVenv;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export default async function createPythonVenv(options: VenvCreateOptions): Promise<boolean> {
  const {pythonPath, destinationFolder, venvName} = options;

  const venvPath = join(destinationFolder, venvName);
  const command = `${pythonPath} -m venv ${venvPath}`;

  return new Promise(resolve => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error creating virtual environment: ${error.message}`);

        if (stderr) {
          console.error(stderr);
        }

        resolve(false);
        return;
      }

      if (stderr) {
        if (stderr.includes('Error:')) {
          console.error(`Error creating virtual environment: ${stderr}`);
          resolve(false);
          return;
        } else {
          console.warn(stderr);
        }
      }

      console.log(stdout);
      console.log(`Virtual environment created successfully at: ${venvPath}`);
      updateVenvStorage(venvPath);
      resolve(true);
    });
  });
}
