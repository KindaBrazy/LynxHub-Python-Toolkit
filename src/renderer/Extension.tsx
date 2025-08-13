import './index.css';

import {Code} from '@heroui/react';
import {notification} from 'antd';
import {isString} from 'lodash';
import {Fragment, useEffect} from 'react';
import {useDispatch} from 'react-redux';

import {ExtensionRendererApi} from '../../../src/renderer/src/App/Extensions/ExtensionTypes_Renderer_Api';
import CardMenu from './components/CardMenu';
import CardMenuModal from './components/CardMenuModal';
import SettingsModal from './components/Settings/SettingsModal';
import ToolsPage from './components/ToolsPage';
import {setCards} from './DataHolder';
import listenForEvents from './ListenForEvents';
import pIpc from './PIpc';
import pythonToolkitReducer, {PythonToolkitActions} from './reducer';

function UpdateReducer() {
  const dispatch = useDispatch();

  useEffect(() => {
    pIpc.getCacheStorageUsage().then(result => {
      dispatch(PythonToolkitActions.setCacheStorageUsage(result));
    });
    pIpc.getPkgDisplay().then(result => {
      dispatch(PythonToolkitActions.setPkgDisplay(result));
    });

    pIpc.onErrorGetVenvInfo((_, e) => {
      const message = e.message;
      if (message && isString(message)) {
        if (message.toLowerCase().includes('no python at')) {
          console.info(message);
          notification.error({
            message: 'Python Not Found',
            description: (
              <div>
                <span className="!text-md whitespace-pre-line">
                  {`Required Python version is missing. Please install it, so LynxHub can validate` +
                    ` your environment.\nDetails:\n`}
                </span>
                <Code
                  color="warning"
                  className="whitespace-pre-line text-nowrap font-JetBrainsMono w-full overflow-auto">
                  {message.replace("Error invoking remote method 'get-venvs': Error:", '')}
                </Code>
              </div>
            ),
            className: '!w-fit !max-w-[777px]',
            duration: 0,
          });
        }
      }
    });

    return () => {
      pIpc.offErrorGetVenvInfo();
    };
  }, []);

  return <Fragment />;
}

export function InitialExtensions(lynxAPI: ExtensionRendererApi) {
  listenForEvents(lynxAPI);
  setCards(lynxAPI.modulesData?.allCards || []);

  lynxAPI.addReducer([{name: 'pythonToolkit', reducer: pythonToolkitReducer}]);
  lynxAPI.addModal(CardMenuModal);
  lynxAPI.addModal(SettingsModal);

  lynxAPI.customizePages.tools.addComponent(ToolsPage);
  lynxAPI.cards.customize.menu.addSection([{index: 1, components: [CardMenu]}]);
  lynxAPI.addCustomHook(UpdateReducer);
}
