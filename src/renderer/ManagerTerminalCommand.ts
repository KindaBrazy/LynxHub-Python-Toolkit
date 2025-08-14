import {Python_AvailableModules} from '../cross/CrossExtConstants';
import {PythonVenvSelectItem} from '../cross/CrossExtTypes';
import {Installer_PythonSelector} from './components/Modules/Installer_PythonSelector';
import pIpc from './PIpc';

const getStorageId = (id: string) => `${id}_startCommand`;

function SetTerminalCommand(set: (id: string, command: string[]) => void) {
  return (id: string, item: PythonVenvSelectItem) => {
    const isWin = window.osPlatform === 'win32';

    if (id === Python_AvailableModules.comfyui) {
      switch (item.type) {
        case 'python': {
          const command = isWin
            ? `$env:Path = "${item.dir};${item.dir}/Scripts" + $env:Path`
            : `export PATH="${item.dir}:${item.dir}/bin:$PATH"`;
          set(id, [command]);
          window.localStorage.setItem(getStorageId(id), JSON.stringify([command]));
          pIpc.setCardStartCommand({id, commands: [command]});
          break;
        }
        case 'venv': {
          const command = isWin ? `${item.dir}/Scripts/activate.ps1` : `source ${item.dir}/bin/activate`;
          set(id, [command]);
          window.localStorage.setItem(getStorageId(id), JSON.stringify([command]));
          pIpc.setCardStartCommand({id, commands: [command]});
          break;
        }
        case 'conda': {
          const command = `conda activate ${item.condaName || `--prefix "${item.dir}"`}`;
          set(id, [command]);
          window.localStorage.setItem(getStorageId(id), JSON.stringify([command]));
          pIpc.setCardStartCommand({id, commands: [command]});
          break;
        }
      }
    }
  };
}

export function onIntiExtension() {
  pIpc.getCardStartCommand().then(result => {
    if (result) {
      result.forEach(item => window.localStorage.setItem(getStorageId(item.id), JSON.stringify(item.commands)));
    }
  });
}

export function onCardStart(id: string, addCommand: (commands: string | string[]) => void) {
  const command = window.localStorage.getItem(getStorageId(id));
  if (command) addCommand(JSON.parse(command) as string[]);
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
