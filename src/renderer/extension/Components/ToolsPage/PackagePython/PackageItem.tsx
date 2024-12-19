import {Button, Popover, PopoverContent, PopoverTrigger, Spinner} from '@nextui-org/react';
import {List, message} from 'antd';
import {ReactNode, useCallback, useMemo, useState} from 'react';
import semver from 'semver';

import {PackageInfo} from '../../../../../cross/CrossExtensions';
import {Download_Icon} from '../../../../src/assets/icons/SvgIcons/SvgIcons1';
import {Trash_Icon} from '../../../../src/assets/icons/SvgIcons/SvgIcons3';
import pIpc from '../../../PIpc';
import {Warn_Icon} from '../../SvgIcons';

function getUpdateType(currentVersion: string, updateVersion: string) {
  const currentVersionNormalized = semver.coerce(currentVersion)?.version;
  const updateVersionNormalized = semver.coerce(updateVersion)?.version;

  if (!currentVersionNormalized || !updateVersionNormalized) {
    console.warn(`Invalid version(s): current=${currentVersion}, update=${updateVersion}`);
    return 'text-gray-500';
  }

  return semver.diff(currentVersionNormalized, updateVersionNormalized);
}

function getUpdateVersionColor(currentVersion: string, updateVersion: string) {
  const updateType = getUpdateType(currentVersion, updateVersion);

  switch (updateType) {
    case 'prerelease':
      return 'text-blue-500';
    case 'major':
      return 'text-red-500';
    case 'minor':
      return 'text-yellow-500';
    case 'patch':
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
}

type Props = {
  item: PackageInfo;
  pythonPath: string;
  updated: (name: string, newVersion: string) => void;
  removed: (name: string) => void;
};

export default function PackageItem({item, pythonPath, updated, removed}: Props) {
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

  const actions = useMemo(() => {
    const result = [
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
          <Button radius="sm" color="danger" variant="light" startContent={<Trash_Icon />} isIconOnly />
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
      </Popover>,
    ];
    if (item.updateVersion)
      result.unshift(
        <Button
          radius="sm"
          key="update"
          variant="flat"
          color="success"
          onPress={update}
          startContent={<Download_Icon />}
          isIconOnly
        />,
      );

    return result;
  }, [item, isOpenPopover]);

  return (
    <List.Item actions={actions} className="relative hover:bg-foreground-100 transition-colors duration-150 !pr-1">
      {loading && <div className="inset-0 bg-black/50 z-10 absolute flex justify-center items-center">{loading}</div>}
      <List.Item.Meta
        title={
          <div className="flex flex-row items-center gap-x-1 text-medium font-semibold">
            <span>{item.name}</span>
            {item.updateVersion && (
              <Warn_Icon className={`${getUpdateVersionColor(item.version, item.updateVersion)} size-[1.1rem]`} />
            )}
          </div>
        }
        description={
          <div className="flex flex-row items-center gap-x-1 text-tiny">
            <span>{item.version}</span>
            {item.updateVersion && (
              <span>
                (<span className={getUpdateVersionColor(item.version, item.updateVersion)}>{item.updateVersion}</span>)
              </span>
            )}
          </div>
        }
      />
    </List.Item>
  );
}
