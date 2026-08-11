import './index.css';

import type {ExtensionRendererApi} from '@lynx/plugins/extensions/types/api';

import {SENTRY_DSN} from '../cross/CrossExtConstants';
import CardMenu from './components/CardMenu';
import CardMenuModal from './components/CardMenuModal';
import PythonToolkitPage from './components/Python/PythonToolkitPage';
import {PythonIcon} from './components/SvgIcons';
import PythonToolkitCard from './components/ToolsPage';
import {DepsModalKey} from './consts';
import CustomHook from './CustomHook';
import {setCards, setTheActivePage, setToast} from './DataHolder';
import listenForEvents from './ListenForEvents';
import pIpc from './PIpc';
import pythonToolkitReducer from './reducer';

export function InitialExtensions(lynxAPI: ExtensionRendererApi) {
  lynxAPI.initBrowserSentry(SENTRY_DSN);

  if (lynxAPI.tabs) setTheActivePage(lynxAPI.tabs.setActivePage);
  setCards(lynxAPI.modulesData?.allCards || []);
  if (lynxAPI.toast) setToast(lynxAPI.toast);

  listenForEvents(lynxAPI);

  lynxAPI.addReducer([{name: 'pythonToolkit', reducer: pythonToolkitReducer}]);
  lynxAPI.router.addPage({
    id: 'python-toolkit',
    title: 'Python Toolkit',
    component: PythonToolkitPage,
    icon: <PythonIcon />,
    position: 'hidden',
  });

  lynxAPI.cards.registerToolsCard?.({
    id: 'python-toolkit',
    title: 'Python Toolkit',
    description: 'Manage Python versions, virtual environments, packages, requirements and more.',
    component: PythonToolkitCard,
    where: 'tools_page',
  });

  if (!lynxAPI.cards.registerToolsCard) {
    lynxAPI.customizePages.tools.add.cardsContainer(PythonToolkitCard);
  }

  lynxAPI.cards.customize.menu.addSection([{index: 1, components: [CardMenu]}]);
  lynxAPI.cards.customize.menu.addModal([{key: DepsModalKey, component: CardMenuModal}]);

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
