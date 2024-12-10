import {Button, Input} from '@nextui-org/react';
import {List} from 'antd';
import {useState} from 'react';

import {Add_Icon, Circle_Icon} from '../../../src/assets/icons/SvgIcons/SvgIcons1';
import {Refresh3_Icon} from '../../../src/assets/icons/SvgIcons/SvgIcons4';
import PackageCard from './PackageCard';

export type DataType = {
  name: string;
  version: string;
  versionUpdate?: string | undefined;
  size: number;
};

export default function PythonPackageManager({visible}: {visible: boolean}) {
  const [data] = useState<DataType[]>([
    {name: 'requests', version: '2.31.0', size: 5.2},
    {
      name: 'pandas',
      version: '1.5.3',
      size: 125,
      versionUpdate: '2.1.0',
    },
    {
      name: 'numpy',
      version: '1.24.3',
      versionUpdate: '1.25.2',
      size: 84,
    },
  ]);
  const [maxDiskValue] = useState<number>(300);

  if (!visible) return null;
  return (
    <div className="w-full flex flex-col gap-y-4">
      <div className="w-full flex flex-row justify-between items-center">
        <span className="font-bold">Package Management</span>
        <div className="space-x-2">
          <Button radius="sm" variant="faded" color="success" startContent={<Refresh3_Icon />}>
            Update All
          </Button>
          <Button radius="sm" variant="solid" startContent={<Add_Icon />}>
            Install Package
          </Button>
        </div>
      </div>
      <div className="flex flex-row gap-8 flex-wrap">
        <Input radius="sm" startContent={<Circle_Icon />} placeholder="Search packages..." />
        <List
          renderItem={item => (
            <List.Item className="w-full">
              <PackageCard {...item} maxDiskValue={maxDiskValue} />
            </List.Item>
          )}
          dataSource={data}
          className="w-full"
        />
      </div>
    </div>
  );
}
