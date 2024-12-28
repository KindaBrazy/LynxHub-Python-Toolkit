import {dirname} from 'node:path';

import {isEmpty, isNil} from 'lodash';

import {storageManager} from '../lynxExtension';
import {getAIVenvs} from './PackageManager/PackageManager';

function updatePreCommand(id: string, pythonExe: string) {
  const command: string = `"${dirname(pythonExe)}\\activate.ps1"`;

  const existingCommands = storageManager?.getPreCommandById(id);
  if (existingCommands && existingCommands.data.includes(command)) return;

  storageManager?.addPreCommand(id, command);
}

async function updateArguments(id: string, pythonExe: string) {
  const venvPath = dirname(dirname(pythonExe));

  const existingArgs = await storageManager?.getCardArgumentsById(id);

  if (!existingArgs) return;

  const activePreset = existingArgs.activePreset;
  const data = existingArgs.data.find(item => item.preset === activePreset);

  if (!data) return;

  function findOrUpdateArgument(name: string, value: string) {
    const existingArgument = data!.arguments.find(arg => arg.name === name);
    if (existingArgument) {
      existingArgument.value = value;
    } else {
      data!.arguments.push({name, value});
    }
  }

  findOrUpdateArgument('PYTHON', pythonExe);

  findOrUpdateArgument('VENV_DIR', venvPath);

  storageManager?.setCardArguments(id, existingArgs);
}

export async function checkAIVenvsEnabled() {
  const venvs = getAIVenvs();
  if (isNil(venvs) || isEmpty(venvs)) {
    return;
  }

  const updatePromises: Promise<void>[] = [];
  const preCommandUpdates: (() => void)[] = [];

  for (const venv of venvs) {
    switch (venv.id) {
      case 'LSHQQYTIGER_SD':
      case 'LSHQQYTIGER_Forge_SD':
      case 'Automatic1111_SD':
      case 'VLADMANDIC_SD':
      case 'Lllyasviel_SD':
      case 'Anapnoe_SD':
        updatePromises.push(updateArguments(venv.id, venv.path));
        break;
      case 'ComfyUI_SD':
      case 'ComfyUI_Zluda_ID':
      case 'Nerogar_SD':
      case 'Erew123_SD':
      case 'Oobabooga_TG':
      case 'Gitmylo_AG':
        preCommandUpdates.push(() => updatePreCommand(venv.id, venv.path));
        break;
      case 'Bmaltais_SD':
        // TODO -> https://github.com/bmaltais/kohya_ss/blob/master/gui.bat
        console.warn(`Venv ${venv.id} is not yet supported.`);
        break;
      case 'Rsxdalv_AG':
        // TODO -> https://github.com/rsxdalv/tts-generation-webui/blob/main/installer_scripts/root.ps1
        console.warn(`Venv ${venv.id} is not yet supported.`);
        break;
      case 'McMonkeyProjects_SD':
      case 'InvokeAI_SD':
      case 'SillyTavern_TG':
        // Not Supported
        console.info(`Venv ${venv.id} is not supported.`);
        break;
      default:
        console.warn(`Unknown venv ID: ${venv.id}`);
        return; // Returning early is likely a bug, so we warn instead
    }
  }

  await Promise.all(updatePromises);

  for (const updateFunc of preCommandUpdates) {
    updateFunc();
  }
}
