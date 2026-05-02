import {Button, Popover} from '@heroui-v3/react';
import {topToast} from '@lynx/layouts/ToastProviders';
import {TrashBin2} from '@solar-icons/react-perf/BoldDuotone';
import {Dispatch, SetStateAction, useCallback, useState} from 'react';

import {PackageInfo, PackageUpdate} from '../../../../../../cross/CrossExtTypes';
import pIpc from '../../../../../PIpc';
import PkgVersions from './PkgVersions';

type Props = {
  item: PackageInfo;
  updated: (list: PackageUpdate | PackageUpdate[]) => void;
  removed: (name: string) => void;
  pythonPath: string;
  isUninstalling: boolean;
  setIsUninstalling: Dispatch<SetStateAction<boolean>>;
};

export default function ActionButtons({item, removed, pythonPath, isUninstalling, setIsUninstalling, updated}: Props) {
  const [isUninstallOpen, setIsUninstallOpen] = useState<boolean>(false);

  const remove = useCallback(() => {
    setIsUninstallOpen(false);
    setIsUninstalling(true);
    pIpc
      .uninstallPackage(pythonPath, item.name)
      .then(() => {
        removed(item.name);
        topToast.success(`Package "${item.name}" removed successfully.`);
      })
      .catch(() => {
        topToast.danger(`Failed to remove package "${item.name}".`);
      })
      .finally(() => {
        setIsUninstalling(false);
      });
  }, [item]);

  return (
    <div className="flex flex-row items-center justify-center gap-x-2">
      <Popover isOpen={isUninstallOpen} onOpenChange={setIsUninstallOpen}>
        <Button size="sm" variant="danger-soft" isPending={isUninstalling} isIconOnly>
          <TrashBin2 />
        </Button>
        <Popover.Content className="max-w-64">
          <Popover.Dialog className="gap-y-2 flex flex-col">
            <Popover.Arrow />
            <span>Are you sure you want to remove the package "{item.name}"?</span>
            <Button size="sm" variant="danger" onPress={remove} fullWidth>
              Remove
            </Button>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>
      <PkgVersions item={item} updated={updated} pythonPath={pythonPath} />
    </div>
  );
}
