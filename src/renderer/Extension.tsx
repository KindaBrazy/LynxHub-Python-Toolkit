import './index.css';

import {ExtensionRendererApi} from '../../../src/renderer/src/App/Extensions/ExtensionTypes_Renderer_Api';
import CardMenu from './components/CardMenu';
import CardMenuModal from './components/CardMenuModal';
import SettingsModal from './components/Settings/SettingsModal';
import ToolsPage from './components/ToolsPage';
import CustomHook from './CustomHook';
import {setCards} from './DataHolder';
import listenForEvents from './ListenForEvents';
import pythonToolkitReducer from './reducer';

export function InitialExtensions(lynxAPI: ExtensionRendererApi) {
  listenForEvents(lynxAPI);
  setCards(lynxAPI.modulesData?.allCards || []);

  lynxAPI.addReducer([{name: 'pythonToolkit', reducer: pythonToolkitReducer}]);
  lynxAPI.addModal(CardMenuModal);
  lynxAPI.addModal(SettingsModal);

  lynxAPI.customizePages.tools.addComponent(ToolsPage);
  lynxAPI.cards.customize.menu.addSection([{index: 1, components: [CardMenu]}]);
  lynxAPI.addCustomHook(CustomHook);
}
