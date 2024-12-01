import {Button} from '@nextui-org/react';

import {getIconByName} from '../../../src/assets/icons/SvgIconsContainer';
import PythonInstalledCard from './PythonInstalledCard';

export default function InstalledPythons() {
  return (
    <div className="w-full flex flex-col gap-y-4">
      <div className="w-full flex flex-row justify-between items-center">
        <span className="font-bold">Installed Versions</span>
        <Button radius="sm" variant="flat" startContent={getIconByName('Add')}>
          Install New Version
        </Button>
      </div>
      <div className="flex flex-row gap-8 flex-wrap">
        <PythonInstalledCard
          diskUsage={100}
          version="3.11.4"
          isDefault={true}
          maxDiskValue={1000}
          architecture="64-bit"
          location="C:/Python311"
        />
        <PythonInstalledCard
          diskUsage={850}
          version="3.10.8"
          isDefault={false}
          maxDiskValue={1000}
          architecture="64-bit"
          location="D:\Programming\LynxHub-Module-Offline-Container\LynxHub-Module-Offline-Container"
        />
        <PythonInstalledCard
          diskUsage={50}
          version="3.9.13"
          isDefault={false}
          maxDiskValue={1000}
          architecture="64-bit"
          location="C:/Python39"
        />
        <PythonInstalledCard
          diskUsage={500}
          version="3.9.13"
          isDefault={false}
          maxDiskValue={1000}
          architecture="64-bit"
          location="C:/Python39"
        />
        <PythonInstalledCard
          diskUsage={250}
          version="3.9.13"
          isDefault={false}
          maxDiskValue={1000}
          architecture="64-bit"
          location="C:/Python39"
        />
      </div>
    </div>
  );
}
