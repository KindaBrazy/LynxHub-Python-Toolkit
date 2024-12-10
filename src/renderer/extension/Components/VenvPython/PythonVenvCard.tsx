import {Button} from '@nextui-org/react';
import {Card} from 'antd';

import {getIconByName} from '../../../src/assets/icons/SvgIconsContainer';

type Props = {
  title: string;
  pythonVersion: string;
  installedPackages: number;
  size: number;
};
export default function PythonVenvCard({title, installedPackages, pythonVersion, size}: Props) {
  const remove = () => {};
  return (
    <Card
      className={
        `min-w-[27rem] grow transition-colors duration-300 shadow-small` +
        'dark:hover:border-white/20 hover:border-black/20 '
      }
      title={
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-col my-3">
            <span>{title}</span>
            <span className="text-tiny text-foreground-500">Python {pythonVersion}</span>
          </div>
          <div className="space-x-2 flex items-center">
            <Button size="sm" color="danger" variant="light" onPress={remove} isIconOnly>
              {getIconByName('Trash', {className: 'size-[50%]'})}
            </Button>
          </div>
        </div>
      }
      classNames={{body: 'gap-y-4'}}>
      <div className="gap-y-4 flex flex-col">
        <div className="w-full justify-between flex flex-row">
          <span>Packages:</span>
          <span>{installedPackages} Installed</span>
        </div>
        <div className="w-full justify-between flex flex-row">
          <span>Size:</span>
          <span>{size} MB</span>
        </div>
      </div>
    </Card>
  );
}
