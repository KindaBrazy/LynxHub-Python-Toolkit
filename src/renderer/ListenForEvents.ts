import {ExtensionRendererApi} from '../../../src/renderer/src/App/Extensions/ExtensionTypes_Renderer_Api';
import {getStep} from './components/Modules/ModuleStepManager';
import pIpc from './PIpc';

export default function listenForEvents(lynxAPI: ExtensionRendererApi) {
  lynxAPI.events.on('card_install_addStep', ({id, addStep}) => {
    const {index, title, content} = getStep(id);
    addStep(index, title, content);
  });

  lynxAPI.events_ipc.on('storage_utils_add_installed_card', ({cardData}) => {
    pIpc.findAIVenv(cardData.id, cardData.dir);
  });
}
