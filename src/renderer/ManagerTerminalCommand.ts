import {isArray} from 'lodash';

import {Python_AvailableModules} from '../cross/CrossExtConstants';
import {AssociateAction, AssociateItem, PythonVenvSelectItem} from '../cross/CrossExtTypes';
import {Installer_PythonSelector} from './components/Modules/Installer_PythonSelector';
import pIpc from './PIpc';

const getStorageId = (id: string) => `${id}_startCommand`;

function getCommandByType(type: 'python' | 'venv' | 'conda', dir: string, condaName?: string) {
  const isWin = window.osPlatform === 'win32';
  switch (type) {
    case 'python': {
      return isWin ? `$env:Path = "${dir};${dir}/Scripts" + $env:Path` : `export PATH="${dir}:${dir}/bin:$PATH"`;
    }
    case 'venv': {
      return isWin ? `${dir}/Scripts/activate.ps1` : `source ${dir}/bin/activate`;
    }
    case 'conda': {
      return `conda activate ${condaName || `--prefix "${dir}"`}`;
    }
  }
}

const storage = {
  set: (id: string, command: string) => window.localStorage.setItem(getStorageId(id), JSON.stringify([command])),
  get: (id: string) => {
    const command = window.localStorage.getItem(getStorageId(id));
    if (command) return JSON.parse(command) as string[];
    return null;
  },
  remove: (id: string) => window.localStorage.removeItem(getStorageId(id)),
};

function SetTerminalCommand(set: (id: string, command: string[]) => void) {
  return (id: string, item: PythonVenvSelectItem) => {
    if (id === Python_AvailableModules.comfyui) {
      const command = getCommandByType(item.type, item.dir);

      set(id, [command]);
      pIpc.setCardStartCommand({id, commands: [command]});
      pIpc.addAssociate({id, dir: item.dir, type: item.type, condaName: item.condaName});
    }
  };
}

export function onCardStart(id: string, addCommand: (commands: string | string[]) => void) {
  const command = storage.get(id);
  if (command) addCommand(command);
}

export function handleAssociateChange(associates: AssociateItem | AssociateItem[] | string, action: AssociateAction) {
  if (action === 'init' && isArray(associates)) {
    associates.forEach(item => {
      const {id, type, dir, condaName} = item;
      storage.set(id, getCommandByType(type, dir, condaName));
    });
  } else {
    const {id, type, dir, condaName} = associates as AssociateItem;
    switch (action) {
      case 'add':
        storage.set(id, getCommandByType(type, dir, condaName));
        break;
      case 'remove':
        storage.remove(associates as string);
        break;
    }
  }
}

export const getStep = (id: string, set: (id: string, command: string[]) => void) => {
  switch (id) {
    case Python_AvailableModules.comfyui:
      return {
        index: 1,
        title: 'Python',
        content: Installer_PythonSelector(id, SetTerminalCommand(set)),
      };
    default:
      return {
        index: 1,
        title: 'Python',
        content: Installer_PythonSelector(id, SetTerminalCommand(set)),
      };
  }
};
