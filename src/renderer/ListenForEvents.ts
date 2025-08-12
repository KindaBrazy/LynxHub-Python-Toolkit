import {ExtensionRendererApi} from '../../../src/renderer/src/App/Extensions/ExtensionTypes_Renderer_Api';
import {Installer_PythonSelector} from './components/Modules/Installer_PythonSelector';

export default function listenForEvents(lynxAPI: ExtensionRendererApi) {
  lynxAPI.events.on('card_install_addStep', ({id, addStep}) => {
    if (id === 'Test') {
      addStep(1, 'Python', Installer_PythonSelector(id));
    }
  });
}
