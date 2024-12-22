import {Button, Popover, PopoverContent, PopoverTrigger} from '@nextui-org/react';
import {message} from 'antd';
import {useCallback, useState} from 'react';

import {PackageInfo} from '../../../../../../cross/extension/CrossExtTypes';
import {getUpdateVersionColor} from '../../../../../../cross/extension/CrossExtUtils';
import pIpc from '../../../../PIpc';
import {Warn_Icon} from '../../../SvgIcons';

type Props = {
  item: PackageInfo;
  pythonPath: string;
  updated: (name: string, newVersion: string) => void;
  removed: (name: string) => void;
  columnKey: string;
  isSelected: boolean;
};

export default function Body_TableItem({item, pythonPath, updated, removed, columnKey, isSelected}: Props) {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isUninstalling, setIsUninstalling] = useState<boolean>(false);
  const [isOpenPopover, setIsOpenPopover] = useState<boolean>(false);

  const update = useCallback(() => {
    setIsUpdating(true);
    pIpc
      .updatePackage(pythonPath, item.name)
      .then(() => {
        updated(item.name, item.updateVersion!);
        message.success(`${item.name} updated successfully`);
      })
      .catch(() => {
        message.error(`Something goes wrong when updating ${item.name}`);
      })
      .finally(() => {
        setIsUpdating(false);
      });
  }, [item]);

  const remove = useCallback(() => {
    setIsOpenPopover(false);
    setIsUninstalling(true);
    pIpc
      .uninstallPackage(pythonPath, item.name)
      .then(() => {
        removed(item.name);
        message.success(`${item.name} removed successfully`);
      })
      .catch(() => {
        message.error(`Something goes wrong when removing ${item.name}`);
      })
      .finally(() => {
        setIsUninstalling(false);
      });
  }, [item]);

  if (columnKey === 'actions') {
    return (
      !isUpdating && (
        <Popover
          size="sm"
          color="danger"
          key="uninstall"
          placement="left"
          isOpen={isOpenPopover}
          className="max-w-[15rem]"
          onOpenChange={setIsOpenPopover}
          showArrow>
          <PopoverTrigger>
            <Button size="sm" color="danger" variant="flat" isLoading={isUninstalling}>
              {isUninstalling ? 'Removing...' : 'Remove'}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="p-2 space-y-2">
              <span>
                Are you sure you want to <span className="font-bold"> remove {item.name}</span>?
              </span>
              <Button size="sm" onPress={remove} fullWidth>
                Remove
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )
    );
  } else if (columnKey === 'update') {
    return (
      (!isSelected || !isUninstalling) &&
      item.updateVersion && (
        <Button size="sm" key="update" variant="flat" color="success" onPress={update} isLoading={isUpdating}>
          {isUpdating ? 'Updating...' : 'Update'}
        </Button>
      )
    );
  } else if (columnKey === 'name') {
    return (
      <>
        <div className="flex flex-col">
          <div className="text-bold text-sm capitalize">
            <div className="flex flex-row items-center gap-x-1 text-medium font-semibold">
              <span>{item.name}</span>
              {item.updateVersion && (
                <Warn_Icon className={`${getUpdateVersionColor(item.version, item.updateVersion)} size-[1.1rem]`} />
              )}
            </div>
          </div>
          <div className="text-bold text-sm capitalize text-default-400">
            <div className="flex flex-row items-center gap-x-1 text-tiny">
              <span>{item.version}</span>
              {item.updateVersion && (
                <span>
                  (<span className={getUpdateVersionColor(item.version, item.updateVersion)}>{item.updateVersion}</span>
                  )
                </span>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}
