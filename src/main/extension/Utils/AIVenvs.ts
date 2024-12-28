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
  for (const venv of venvs) {
    switch (venv.id) {
      case 'LSHQQYTIGER_SD':
        await updateArguments(venv.id, venv.path);
        break;
      case 'LSHQQYTIGER_Forge_SD':
        await updateArguments(venv.id, venv.path);
        break;
      case 'Automatic1111_SD':
        await updateArguments(venv.id, venv.path);
        break;
      case 'ComfyUI_SD':
        updatePreCommand(venv.id, venv.path);
        break;
      case 'ComfyUI_Zluda_ID':
        updatePreCommand(venv.id, venv.path);
        break;
      case 'VLADMANDIC_SD':
        await updateArguments(venv.id, venv.path);
        break;
      case 'McMonkeyProjects_SD':
        // Not Supported
        break;
      case 'Lllyasviel_SD':
        await updateArguments(venv.id, venv.path);
        break;
      case 'Bmaltais_SD':
        // TODO -> https://github.com/bmaltais/kohya_ss/blob/master/gui.bat
        break;
      case 'Nerogar_SD':
        updatePreCommand(venv.id, venv.path);
        break;
      case 'Anapnoe_SD':
        await updateArguments(venv.id, venv.path);
        break;
      case 'InvokeAI_SD':
        // Not Supported
        break;
      case 'Erew123_SD':
        updatePreCommand(venv.id, venv.path);
        break;
      case 'Oobabooga_TG':
        updatePreCommand(venv.id, venv.path);
        break;
      case 'SillyTavern_TG':
        // Not Supported
        break;
      case 'Rsxdalv_AG':
        // TODO -> https://github.com/rsxdalv/tts-generation-webui/blob/main/installer_scripts/root.ps1
        break;
      case 'Gitmylo_AG':
        updatePreCommand(venv.id, venv.path);
        break;
      default:
        return;
    }
  }
}
