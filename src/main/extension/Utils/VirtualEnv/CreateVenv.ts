import {spawnSync} from 'node:child_process';
import {join} from 'node:path';

import {compact, filter, isEmpty, isNil} from 'lodash';

import {VenvCreateOptions, VenvInfo} from '../../../../cross/extension/CrossExtTypes';
import {storageManager} from '../../lynxExtension';
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

function updateVenvStorage(newVenvPath: string) {
  const existVenvs = storageManager?.getCustomData(STORE_VENVS_ID) as string[];

  if (isEmpty(existVenvs)) {
    storageManager?.setCustomData(STORE_VENVS_ID, [newVenvPath]);
  } else {
    const newVenvs = new Set([...existVenvs, newVenvPath]);
    storageManager?.setCustomData(STORE_VENVS_ID, Array.from(newVenvs));
  }
}

export async function getVenvs() {
  const venvs = validateVenvs();

  const venvsInfo: (VenvInfo | null)[] = [];

  for (const venv of venvs) {
    const info = await getVenvInfo(venv);
    venvsInfo.push(info);
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

export default function createPythonVenv(options: VenvCreateOptions): boolean {
  const {pythonPath, destinationFolder, venvName} = options;

  const venvPath = join(destinationFolder, venvName);

  const result = spawnSync(pythonPath, ['-m', 'venv', venvPath], {
    stdio: 'inherit',
  });

  if (result.error) {
    console.error(`Error creating virtual environment: ${result.error.message}`);
    return false;
  }

  if (result.status !== 0) {
    console.error(`Error creating virtual environment. Process exited with code ${result.status}`);
    return false;
  }

  console.log(`Virtual environment created successfully at: ${venvPath}`);
  updateVenvStorage(venvPath);
  return true;
}
