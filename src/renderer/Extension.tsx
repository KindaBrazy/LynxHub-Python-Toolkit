import './index.css';

import {ExtensionRendererApi} from '@lynx_common/types/plugins/extensions/api';

import CardMenu from './components/CardMenu';
import CardMenuModal from './components/CardMenuModal';
import Settings from './components/Settings/Settings';
import ToolsPage from './components/ToolsPage';
import CustomHook from './CustomHook';
import {setCards} from './DataHolder';
import listenForEvents from './ListenForEvents';
import pIpc from './PIpc';
import pythonToolkitReducer from './reducer';

export function InitialExtensions(lynxAPI: ExtensionRendererApi) {
  listenForEvents(lynxAPI);
  setCards(lynxAPI.modulesData?.allCards || []);

  lynxAPI.addReducer([{name: 'pythonToolkit', reducer: pythonToolkitReducer}]);
  lynxAPI.addModal(CardMenuModal);
  lynxAPI.addModal(Settings);

  lynxAPI.customizePages.tools.addComponent(ToolsPage);
  lynxAPI.cards.customize.menu.addSection([{index: 1, components: [CardMenu]}]);
  lynxAPI.addCustomHook(CustomHook);

  pIpc
    .getAppVersion()
    .then(version => {
      window.lynxVersion = version;
    })
    .catch(() => {
      console.log("Can't get the app version.");
    });
}
