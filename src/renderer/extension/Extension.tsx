import './index.css';

import {ExtensionRendererApi} from '../src/App/Extensions/ExtensionTypes_Renderer_Api';
import CardMenu from './components/CardMenu';
import CardMenuModal from './components/CardMenuModal';
import ToolsPage from './components/ToolsPage';
import {setCards} from './DataHolder';
import pythonToolkitReducer from './reducer';

export function InitialExtensions(lynxAPI: ExtensionRendererApi) {
  setCards(lynxAPI.modulesData?.allCards || []);

  lynxAPI.addReducer([{name: 'pythonToolkit', reducer: pythonToolkitReducer}]);
  lynxAPI.addModal(CardMenuModal);

  lynxAPI.customizePages.tools.addComponent(ToolsPage);
  lynxAPI.cards.customize.menu.addSection([{index: 1, components: [CardMenu]}]);
}
