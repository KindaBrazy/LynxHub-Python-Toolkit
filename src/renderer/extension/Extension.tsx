import './index.css';

import {Button} from '@nextui-org/react';
import {useState} from 'react';

import {ExtensionRendererApi} from '../src/App/Extensions/ExtensionTypes_Renderer_Api';
import PythonToolkitModal from './Components/PythonToolkitModal';
import {Python_Icon} from './Components/SvgIcons';

function ToolsPage() {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };
  return (
    <>
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
    </>
  );
}

export function InitialExtensions(lynxAPI: ExtensionRendererApi) {
  lynxAPI.customizePages.tools.addComponent(ToolsPage);
}
