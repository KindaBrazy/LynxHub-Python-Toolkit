import {Python_AvailableModules} from '../cross/CrossExtConstants';
import {PythonVenvSelectItem} from '../cross/CrossExtTypes';
import {Installer_PythonSelector} from './components/Modules/Installer_PythonSelector';
import pIpc from './PIpc';

function addAssociate(id: string, item: PythonVenvSelectItem) {
  if (id === Python_AvailableModules.comfyui) {
    pIpc.addAssociate({id, dir: item.dir, type: item.type, condaName: item.condaName});
  }
}

export const getStep = (id: string) => {
  switch (id) {
    case Python_AvailableModules.comfyui:
      return {
        index: 1,
        title: 'Python',
        content: Installer_PythonSelector(id, addAssociate),
      };
    default:
      return {
        index: 1,
        title: 'Python',
        content: Installer_PythonSelector(id, addAssociate),
      };
  }
};
