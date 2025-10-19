import {AvailableModules, ModulesThatSupportPython} from '../../../cross/CrossExtConstants';
import {PythonVenvSelectItem} from '../../../cross/CrossExtTypes';
import pIpc from '../../PIpc';
import {Installer_PythonSelector} from './Installer_PythonSelector';

function addAssociate(id: string, item: PythonVenvSelectItem) {
  if (ModulesThatSupportPython.includes(id)) {
    pIpc.addAssociate({id, dir: item.dir, type: item.type, condaName: item.condaName});
  }
}

export const getStep = (id: string) => {
  let index: number;

  switch (id) {
    case AvailableModules.sdForge:
    case AvailableModules.comfyui:
    case AvailableModules.comfyuiZluda:
    case AvailableModules.sdNext:
    case AvailableModules.a1:
    case AvailableModules.sdAmd:
    case AvailableModules.sdForgeAmd:
    case AvailableModules.onetrainer:
    case AvailableModules.kohya:
    case AvailableModules.sdUiux:
    case AvailableModules.tg:
    case AvailableModules.lollms:
    case AvailableModules.ag:
    case AvailableModules.alltalk:
      index = 2;
      break;
    case AvailableModules.invoke:
    case AvailableModules.openWebui:
    default:
      index = 1;
      break;
  }

  return {
    index,
    title: 'Python',
    content: Installer_PythonSelector(id, addAssociate),
  };
};
