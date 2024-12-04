import './index.css';

import {Button} from '@nextui-org/react';
import {ConfigProvider, theme} from 'antd';
import {useMemo, useState} from 'react';

import {ExtensionRendererApi} from '../src/App/Extensions/ExtensionTypes_Renderer_Api';
import {useAppState} from '../src/App/Redux/App/AppReducer';
import PythonToolkitModal from './Components/PythonToolkitModal';
import {Python_Icon} from './Components/SvgIcons';

function ToolsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const darkMode = useAppState('darkMode');

  const openModal = () => {
    setIsOpen(true);
  };

  const algorithm = useMemo(() => (darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm), [darkMode]);
  const colorBgSpotlight = useMemo(() => (darkMode ? '#424242' : 'white'), [darkMode]);
  const colorTextLightSolid = useMemo(() => (darkMode ? 'white' : 'black'), [darkMode]);

  return (
    <ConfigProvider
      theme={{
        algorithm,
        components: {
          Button: {colorPrimaryBorder: 'rgba(0,0,0,0)'},
          Tooltip: {colorBgSpotlight, colorTextLightSolid},
        },
        token: {colorBgMask: 'rgba(0, 0, 0, 0.2)', fontFamily: 'Nunito, sans-serif'},
      }}>
      <Button
        variant="faded"
        onPress={openModal}
        className="w-60 h-auto py-4 shadow-small hover:shadow-medium transition-shadow duration-300">
        <div className="space-y-4 size-full">
          <span className="justify-center flex font-semibold text-[13pt]">Python Toolkit</span>
          <Python_Icon className="size-full p-4 opacity-70" />
        </div>
      </Button>
      <PythonToolkitModal isOpen={isOpen} setIsOpen={setIsOpen} />
    </ConfigProvider>
  );
}

export function InitialExtensions(lynxAPI: ExtensionRendererApi) {
  lynxAPI.customizePages.tools.addComponent(ToolsPage);
}
