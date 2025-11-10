import {Button, Input, Popover, PopoverContent, PopoverTrigger} from '@heroui/react';
import {isEmpty} from 'lodash';
import {Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';
import semver, {compare, valid} from 'semver';

import {lynxTopToast} from '../../../../../../../src/renderer/src/App/Utils/UtilHooks';
import {PackageInfo, PackageUpdate} from '../../../../../cross/CrossExtTypes';
import pIpc from '../../../../PIpc';
import {SolarBoxMinimalisticBoldDuotone, TrashDuo_Icon} from '../../../SvgIcons';

type Props = {
  item: PackageInfo;
  updated: (list: PackageUpdate | PackageUpdate[]) => void;
  removed: (name: string) => void;
  pythonPath: string;
  isUninstalling: boolean;
  setIsUninstalling: Dispatch<SetStateAction<boolean>>;
};

type UpgradePropType = {color: 'default' | 'success' | 'warning'; disabled: boolean; title: string};

export default function ActionButtons({item, removed, pythonPath, isUninstalling, setIsUninstalling, updated}: Props) {
  const [isUninstallOpen, setIsUninstallOpen] = useState<boolean>(false);
  const dispatch = useDispatch();

  const [isChangeItemOpen, setIsChangeItemOpen] = useState<boolean>(false);
  const [versionValue, setVersionValue] = useState<string>(item.version);
  const [isChanging, setIsChanging] = useState<boolean>(false);

  useEffect(() => {
    if (!isChangeItemOpen) setVersionValue(item.version);
  }, [isChangeItemOpen]);

  const remove = useCallback(() => {
    setIsUninstallOpen(false);
    setIsUninstalling(true);
    pIpc
      .uninstallPackage(pythonPath, item.name)
      .then(() => {
        removed(item.name);
        lynxTopToast(dispatch).success(`Package "${item.name}" removed successfully.`);
      })
      .catch(() => {
        lynxTopToast(dispatch).error(`Failed to remove package "${item.name}".`);
      })
      .finally(() => {
        setIsUninstalling(false);
      });
  }, [item]);

  const changeVersion = useCallback(() => {
    setIsChanging(true);
    setIsChangeItemOpen(false);
    pIpc
      .changePackageVersion(pythonPath, item.name, item.version, versionValue)
      .then(() => {
        updated({name: item.name, targetVersion: versionValue});
        lynxTopToast(dispatch).success(`${item.name} package changed to ${versionValue}`);
      })
      .catch(e => {
        lynxTopToast(dispatch).error(e);
      })
      .finally(() => {
        setIsChanging(false);
      });
  }, [pythonPath, item, versionValue]);

  const upgradeProps: UpgradePropType = useMemo(() => {
    if (isEmpty(versionValue)) return {color: 'default', title: 'Invalid Version', disabled: true};

    const currentVersion = semver.coerce(item.version)?.version;
    const targetVersion = semver.coerce(versionValue)?.version;
    if (!currentVersion || !targetVersion) return {color: 'default', title: 'Change version', disabled: false};

    const areVersionsValid = valid(currentVersion) && valid(targetVersion);
    if (!areVersionsValid) {
      return {color: 'default', title: 'Change version', disabled: false};
    }

    const comparison = compare(currentVersion, targetVersion);
    if (comparison === 0) {
      return {color: 'default', title: 'No Different', disabled: true};
    }

    const isUpgrade = comparison === -1;
    return {
      color: isUpgrade ? 'success' : 'warning',
      title: isUpgrade ? 'Upgrade' : 'Downgrade',
      disabled: false,
    };
  }, [item, versionValue]);

  return (
    <div className="flex flex-row items-center justify-center gap-x-2">
      <Popover
        size="sm"
        color="danger"
        key="uninstall"
        placement="left"
        isOpen={isUninstallOpen}
        className="max-w-[15rem]"
        onOpenChange={setIsUninstallOpen}
        showArrow>
        <PopoverTrigger>
          <Button size="sm" color="danger" variant="flat" isLoading={isUninstalling} isIconOnly>
            <TrashDuo_Icon className="size-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="p-2 space-y-2">
            <span>Are you sure you want to remove the package &#34;{item.name}&#34;?</span>
            <Button size="sm" onPress={remove} fullWidth>
              Remove
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <Popover
        size="sm"
        placement="left"
        key="change_item"
        isOpen={isChangeItemOpen}
        className="max-w-[15rem]"
        onOpenChange={setIsChangeItemOpen}
        showArrow>
        <PopoverTrigger>
          <Button size="sm" variant="flat" isLoading={isChanging} isIconOnly>
            <SolarBoxMinimalisticBoldDuotone className="size-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="p-2 space-y-2 flex flex-col items-center">
            <span className="text-lg">{item.name}</span>
            <Input size="sm" value={versionValue} onValueChange={setVersionValue} />
            <Button
              size="sm"
              onPress={changeVersion}
              color={upgradeProps.color}
              isDisabled={upgradeProps.disabled}
              fullWidth>
              {upgradeProps.title}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
