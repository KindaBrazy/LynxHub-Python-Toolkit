import {Button} from '@nextui-org/react';
import {useState} from 'react';

import PythonToolkitModal from './Python/PythonToolkitModal';
import {Python_Color_Icon} from './SvgIcons';
import UIProvider from './UIProvider';

export default function ToolsPage() {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };

  return (
    <UIProvider>
      <Button
        variant="faded"
        onPress={openModal}
        className="w-60 h-auto py-4 shadow-small hover:shadow-medium transition-shadow duration-300">
        <div className="space-y-4 size-full">
          <span className="justify-center flex font-semibold text-[13pt]">Python Toolkit</span>
          <Python_Color_Icon className="size-full p-5" />
        </div>
      </Button>
      <PythonToolkitModal isOpen={isOpen} setIsOpen={setIsOpen} />
    </UIProvider>
  );
}
