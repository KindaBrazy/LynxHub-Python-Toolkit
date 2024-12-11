import {Button, Popover, PopoverContent, PopoverTrigger} from '@nextui-org/react';
import {Card, message, Spin} from 'antd';
import {isNil} from 'lodash';
import {useMemo, useState} from 'react';

import {formatSizeMB} from '../../../../cross/CrossUtils';
import rendererIpc from '../../../src/App/RendererIpc';
import {Trash_Icon} from '../../../src/assets/icons/SvgIcons/SvgIcons3';
import {OpenFolder_Icon} from '../../../src/assets/icons/SvgIcons/SvgIcons4';

type Props = {
  title: string;
  pythonVersion: string;
  installedPackages: number;
  folder: string;
  diskUsage: {path: string; value: number | undefined}[];
};
export default function PythonVenvCard({title, installedPackages, pythonVersion, folder, diskUsage}: Props) {
  const [popoverUninstaller, setPopoverUninstaller] = useState<boolean>(false);

  const size = useMemo(() => {
    return diskUsage.find(usage => usage.path === folder)?.value;
  }, [diskUsage]);

  const [isRemoving, setIsRemoving] = useState<boolean>(false);
  const remove = () => {
    setPopoverUninstaller(false);
    setIsRemoving(true);
    rendererIpc.file
      .trashDir(folder)
      .then(() => {
        message.error(`${title} removed successfully`);
      })
      .catch(() => {
        message.error(`Failed to remove ${title}`);
      })
      .finally(() => {
        setIsRemoving(false);
      });
  };
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
            <Popover
              size="sm"
              color="danger"
              placement="left"
              className="max-w-[15rem]"
              isOpen={popoverUninstaller}
              onOpenChange={setPopoverUninstaller}
              showArrow>
              <PopoverTrigger>
                <Button size="sm" color="danger" variant="light" isLoading={isRemoving} isIconOnly>
                  <Trash_Icon className="size-[50%]" />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="p-2 space-y-2">
                  <span>
                    This will permanently delete the <span className="font-bold">{title}</span> folder and all its
                    contents. Are you sure you want to proceed?
                  </span>
                  <Button size="sm" onPress={remove} fullWidth>
                    Remove
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
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
          {isNil(size) ? <Spin size="small" /> : <span>{formatSizeMB(size || 0)}</span>}
        </div>
      </div>
    </Card>
  );
}
