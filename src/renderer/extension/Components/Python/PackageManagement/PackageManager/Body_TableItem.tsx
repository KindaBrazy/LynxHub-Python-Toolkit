import {Button, Popover, PopoverContent, PopoverTrigger, Spinner} from '@nextui-org/react';
import {message} from 'antd';
import {ReactNode, useCallback, useState} from 'react';

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
};

export default function Body_TableItem({item, pythonPath, updated, removed, columnKey}: Props) {
  const [loading, setLoading] = useState<ReactNode>(undefined);
  const [isOpenPopover, setIsOpenPopover] = useState<boolean>(false);

  const update = useCallback(() => {
    setLoading(<Spinner size="sm" color="success" label="Updating..." />);
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
        setLoading(undefined);
      });
  }, [item]);

  const uninstall = useCallback(() => {
    setIsOpenPopover(false);
    setLoading(<Spinner size="sm" color="danger" label="Uninstalling..." />);
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
        setLoading(undefined);
      });
  }, [item]);

  if (columnKey === 'remove') {
    return (
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
          <Button size="sm" color="danger" variant="flat">
            Remove
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="p-2 space-y-2">
            <span>
              Are you sure you want to <span className="font-bold"> remove {item.name}</span>?
            </span>
            <Button size="sm" onPress={uninstall} fullWidth>
              Remove
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  } else if (columnKey === 'update') {
    return (
      item.updateVersion && (
        <Button size="sm" key="update" variant="flat" color="success" onPress={update}>
          Update
        </Button>
      )
    );
  } else if (columnKey === 'name') {
    return (
      <>
        {loading && <div className="inset-0 bg-black/50 z-10 absolute flex justify-center items-center">{loading}</div>}
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
