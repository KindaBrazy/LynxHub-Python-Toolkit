import {Button} from '@nextui-org/react';
import {Card} from 'antd';

import rendererIpc from '../../../src/App/RendererIpc';
import {Trash_Icon} from '../../../src/assets/icons/SvgIcons/SvgIcons3';
import {OpenFolder_Icon} from '../../../src/assets/icons/SvgIcons/SvgIcons4';

type Props = {
  title: string;
  pythonVersion: string;
  installedPackages: number;
  size: number;
  folder: string;
};
export default function PythonVenvCard({title, installedPackages, pythonVersion, size, folder}: Props) {
  const remove = () => {};
  const openPath = () => {
    rendererIpc.file.openPath(folder);
  };
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
              <Trash_Icon className="size-[50%]" />
            </Button>
          </div>
        </div>
      }
      classNames={{body: 'gap-y-4'}}>
      <div className="gap-y-4 flex flex-col">
        <Button size="sm" variant="light" onPress={openPath} className="flex flex-row justify-start -ml-3">
          <OpenFolder_Icon className="flex-shrink-0" />
          <span className="truncate">{folder}</span>
        </Button>
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
