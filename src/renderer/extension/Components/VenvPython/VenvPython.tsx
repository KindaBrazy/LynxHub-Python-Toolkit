import {Button} from '@nextui-org/react';

import {getIconByName} from '../../../src/assets/icons/SvgIconsContainer';
import PythonVenvCard from './PythonVenvCard';

export default function VenvPython({visible}: {visible: boolean}) {
  if (!visible) return null;
  return (
    <div className="w-full flex flex-col gap-y-4">
      <div className="w-full flex flex-row justify-between items-center">
        <span className="font-bold">Virtual Environments</span>
        <Button radius="sm" variant="solid" startContent={getIconByName('Add')}>
          Create Environments
        </Button>
      </div>
      <div className="flex flex-row gap-8 flex-wrap">
        <PythonVenvCard size={100} isActive={true} title="web-project" pythonVersion="3.11.4" installedPackages={12} />
        <PythonVenvCard size={100} isActive={false} title="web-project" pythonVersion="3.9.13" installedPackages={52} />
      </div>
    </div>
  );
}
