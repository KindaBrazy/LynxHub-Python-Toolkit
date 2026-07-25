import {AvailableModules, getOriginalCardId, isPythonSupportedModule} from '../../../cross/CrossExtConstants';
import {PythonVenvSelectItem} from '../../../cross/CrossExtTypes';
import pIpc from '../../PIpc';
import {Installer_PythonSelector} from './Installer_PythonSelector';

function associate(id: string, type: 'add' | 'remove', item?: PythonVenvSelectItem) {
  if (type === 'add' && item && isPythonSupportedModule(id)) {
    pIpc.addAssociate({id, dir: item.dir, type: item.type, condaName: item.condaName});
  } else if (type === 'remove') {
    pIpc.removeAssociate(id);
  }
}

export const getStep = (id: string) => {
  let index: number;

  switch (getOriginalCardId(id)) {
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
    case AvailableModules.aiToolkit:
    case AvailableModules.smartGallery:
    case AvailableModules.loraManager:
    case AvailableModules.chatTTS:
    case AvailableModules.llamaFactory:
      index = 2;
      break;
    case AvailableModules.invoke:
    case AvailableModules.openWebui:
    case AvailableModules.langFlow:
    default:
      index = 1;
      break;
  }

  return {
    index,
    title: 'Python',
    content: Installer_PythonSelector(id, associate),
  };
};
