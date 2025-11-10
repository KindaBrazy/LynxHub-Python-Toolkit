import {Button, Popover, PopoverContent, PopoverTrigger} from '@heroui/react';
import {Dispatch, SetStateAction, useCallback, useState} from 'react';
import {useDispatch} from 'react-redux';

import {lynxTopToast} from '../../../../../../../../src/renderer/src/App/Utils/UtilHooks';
import {PackageInfo, PackageUpdate} from '../../../../../../cross/CrossExtTypes';
import pIpc from '../../../../../PIpc';
import {TrashDuo_Icon} from '../../../../SvgIcons';
import PkgVersions from './PkgVersions';

type Props = {
  item: PackageInfo;
  updated: (list: PackageUpdate | PackageUpdate[]) => void;
  removed: (name: string) => void;
  pythonPath: string;
  isUninstalling: boolean;
  setIsUninstalling: Dispatch<SetStateAction<boolean>>;
  show: string;
};

export default function ActionButtons({
  item,
  removed,
  pythonPath,
  isUninstalling,
  setIsUninstalling,
  updated,
  show,
}: Props) {
  const [isUninstallOpen, setIsUninstallOpen] = useState<boolean>(false);
  const dispatch = useDispatch();

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

      <PkgVersions show={show} item={item} updated={updated} pythonPath={pythonPath} />
    </div>
  );
}
