import {ExtensionRendererApi} from '@lynx_cross/types/plugins/extensions/api';

import {ModulesThatSupportPython} from '../cross/CrossExtConstants';
import {getStep} from './components/Modules/ModuleStepManager';
import pIpc from './PIpc';

export default function listenForEvents(lynxAPI: ExtensionRendererApi) {
  lynxAPI.events.on('card_install_addStep', ({id, addStep}) => {
    if (ModulesThatSupportPython.includes(id)) {
      const {index, title, content} = getStep(id);
      addStep(index, title, content);
    }
  });

  lynxAPI.events_ipc.on('storage_utils_add_installed_card', ({cardData}) => {
    pIpc.findAIVenv(cardData.id, cardData.dir);
  });
}
