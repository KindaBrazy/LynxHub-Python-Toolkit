import {Button, Input, Popover, PopoverContent, PopoverTrigger} from '@heroui/react';
import {isEmpty} from 'lodash';
import {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';
import semver, {compare, valid} from 'semver';

import {lynxTopToast} from '../../../../../../../../src/renderer/src/App/Utils/UtilHooks';
import {PackageInfo, PackageUpdate} from '../../../../../../cross/CrossExtTypes';
import pIpc from '../../../../../PIpc';
import {SolarBoxMinimalisticBoldDuotone} from '../../../../SvgIcons';

type UpgradePropType = {color: 'default' | 'success' | 'warning'; disabled: boolean; title: string};
type Props = {
  pythonPath: string;
  item: PackageInfo;
  updated: (list: PackageUpdate | PackageUpdate[]) => void;
};
const PkgVersions = memo(({updated, item, pythonPath}: Props) => {
  const dispatch = useDispatch();

  const [isChangeItemOpen, setIsChangeItemOpen] = useState<boolean>(false);
  const [versionValue, setVersionValue] = useState<string>(item.version);
  const [isChanging, setIsChanging] = useState<boolean>(false);

  useEffect(() => {
    if (!isChangeItemOpen) setVersionValue(item.version);
  }, [isChangeItemOpen]);

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
  );
});

export default PkgVersions;
