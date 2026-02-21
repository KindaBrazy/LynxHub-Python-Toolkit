import {ExtensionRendererApi} from '@lynx_common/types/plugins/extensions/api';

// TODO: Update this after new event implemented

export default function listenForEvents(_lynxAPI: ExtensionRendererApi) {
  /*lynxAPI.events.on('card_install_addStep', ({id, addStep}) => {
    if (ModulesThatSupportPython.includes(id)) {
      const {index, title, content} = getStep(id);
      addStep(index, title, content);
    }
  });

  lynxAPI.events_ipc.on(storageUtilsChannels.addInstalledCard, ({cardData}) => {
    pIpc.findAIVenv(cardData.id, cardData.dir);
  });*/
}
