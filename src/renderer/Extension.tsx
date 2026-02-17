import './index.css';

import {APP_BUILD_NUMBER} from '@lynx_common/consts';
import {ExtensionRendererApi} from '@lynx_common/types/plugins/extensions/api';
import {isDev} from '@lynx_common/utils';

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

  if (
    (typeof window.LynxHub !== 'undefined' && window.LynxHub.buildNumber && window.LynxHub.buildNumber > 45) ||
    (isDev() && APP_BUILD_NUMBER > 44)
  ) {
    lynxAPI.customizePages.tools.add.cardsContainer(ToolsPage);
  } else {
    // @ts-expect-error in old versions api provides addComponent
    lynxAPI.customizePages.tools.addComponent(ToolsPage);
  }

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
