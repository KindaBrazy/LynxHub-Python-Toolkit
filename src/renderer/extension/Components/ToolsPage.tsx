import {Button, Card, CardBody, CardHeader} from '@heroui/react';
import {useState} from 'react';

import {Play_Icon} from '../../src/assets/icons/SvgIcons/SvgIcons2';
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
      <Card
        className={
          `w-[230px] h-fit cursor-default shadow-md !transition border-1 ` +
          `border-foreground/5 duration-300 hover:shadow-xl dark:bg-[#3d3d3d]`
        }>
        <CardHeader>
          <Python_Color_Icon className="w-full h-36 my-1" />
        </CardHeader>
        <CardBody className="text-center text-lg font-semibold bg-foreground-100">Python Toolkit</CardBody>
        <CardBody>
          <Button color="primary" onPress={openModal} fullWidth>
            <Play_Icon className="size-[1.1rem]" />
          </Button>
        </CardBody>
      </Card>
      <PythonToolkitModal isOpen={isOpen} setIsOpen={setIsOpen} />
    </UIProvider>
  );
}
