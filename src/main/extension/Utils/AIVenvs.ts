import {dirname} from 'node:path';

import {isEmpty, isNil} from 'lodash';

import {storageManager} from '../lynxExtension';
import {getAIVenvs} from './PackageManager/PackageManager';

function checkPreCommand(id: string, pythonPath: string) {
  const command: string = `"${dirname(pythonPath)}\\activate.ps1"`;

  const existingCommands = storageManager?.getPreCommandById(id);
  if (existingCommands && existingCommands.data.includes(command)) return;

  storageManager?.addPreCommand(id, command);
}

function removePreCommand(id: string, pythonPath: string) {
  const command: string = `"${dirname(pythonPath)}\\activate.ps1"`;

  const existingCommands = storageManager?.getPreCommandById(id);
  if (existingCommands) {
    const index = existingCommands.data.findIndex(item => item === command);
    if (index !== -1) {
      storageManager?.removePreCommand(id, index);
    }
  }
}

async function checkArguments(id: string, pythonExe: string) {
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

async function removeArguments(id: string, pythonExe: string) {
  const venvPath = dirname(dirname(pythonExe));

  const existingArgs = await storageManager?.getCardArgumentsById(id);

  if (!existingArgs) return;

  const activePreset = existingArgs.activePreset;
  const dataIndex = existingArgs.data.findIndex(item => item.preset === activePreset);

  if (dataIndex === -1) return;

  const data = existingArgs.data[dataIndex];

  function removeArgumentIfPathMatches(name: string, pathToRemove: string) {
    const argumentIndex = data.arguments.findIndex(arg => arg.name === name);
    if (argumentIndex !== -1 && data.arguments[argumentIndex].value === pathToRemove) {
      data.arguments.splice(argumentIndex, 1);
    }
  }

  removeArgumentIfPathMatches('PYTHON', pythonExe);
  removeArgumentIfPathMatches('VENV_DIR', venvPath);

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
        updatePromises.push(checkArguments(venv.id, venv.path));
        break;
      case 'ComfyUI_SD':
      case 'ComfyUI_Zluda_ID':
      case 'Nerogar_SD':
      case 'Erew123_SD':
      case 'Oobabooga_TG':
      case 'Gitmylo_AG':
        preCommandUpdates.push(() => checkPreCommand(venv.id, venv.path));
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

export async function removeAIVenvsEnabled(id: string, pythonPath: string) {
  const argumentsPromises: Promise<void>[] = [];
  const preCommands: (() => void)[] = [];

  switch (id) {
    case 'LSHQQYTIGER_SD':
    case 'LSHQQYTIGER_Forge_SD':
    case 'Automatic1111_SD':
    case 'VLADMANDIC_SD':
    case 'Lllyasviel_SD':
    case 'Anapnoe_SD':
      argumentsPromises.push(removeArguments(id, pythonPath));
      break;
    case 'ComfyUI_SD':
    case 'ComfyUI_Zluda_ID':
    case 'Nerogar_SD':
    case 'Erew123_SD':
    case 'Oobabooga_TG':
    case 'Gitmylo_AG':
      preCommands.push(() => removePreCommand(id, pythonPath));
      break;
    default:
      console.warn(`Unknown venv ID: ${id}`);
      return;
  }

  await Promise.all(argumentsPromises);

  for (const updateFunc of preCommands) {
    updateFunc();
  }
}
