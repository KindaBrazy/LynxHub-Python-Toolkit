import {AvailableModules} from '../../../cross/CrossExtConstants';
import {PythonVenvSelectItem} from '../../../cross/CrossExtTypes';
import pIpc from '../../PIpc';
import {Installer_PythonSelector} from './Installer_PythonSelector';

function addAssociate(id: string, item: PythonVenvSelectItem) {
  if (id === AvailableModules.comfyui) {
    pIpc.addAssociate({id, dir: item.dir, type: item.type, condaName: item.condaName});
  }
}

export const getStep = (id: string) => {
  switch (id) {
    case AvailableModules.comfyui:
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
