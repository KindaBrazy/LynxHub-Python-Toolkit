import {ExtensionRendererApi} from '@lynx/plugins/extensions/types/api';
import {storageUtilsChannels} from '@lynx_common/consts/ipcChannels/storage';

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

  lynxAPI.ipcEvents.onChannel('before', storageUtilsChannels.addInstalledCard, event => {
    if (event.method !== 'send') {
      return;
    }

    const [cardData] = event.args as [{id: string; dir?: string}];
    void pIpc.findAIVenv(cardData.id, cardData.dir);
  });
}
