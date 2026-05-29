import {Button, Popover} from '@heroui/react';
import LynxTooltip from '@lynx/components/LynxTooltip';
import {TrashBin2} from '@solar-icons/react-perf/BoldDuotone';
import {Dispatch, SetStateAction, useCallback, useState} from 'react';

import {PackageInfo, PackageUpdate} from '../../../../../../cross/CrossExtTypes';
import {toastHolder} from '../../../../../DataHolder';
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
        toastHolder?.top.success(`Package "${item.name}" removed successfully.`);
      })
      .catch(() => {
        toastHolder?.top.danger(`Failed to remove package "${item.name}".`);
      })
      .finally(() => {
        setIsUninstalling(false);
      });
  }, [item]);

  return (
    <div className="flex flex-row items-center justify-center gap-x-2">
      <Popover isOpen={isUninstallOpen} onOpenChange={setIsUninstallOpen}>
        <LynxTooltip delay={300} content="Remove package">
          <Button size="sm" variant="danger-soft" isPending={isUninstalling} isIconOnly>
            <TrashBin2 />
          </Button>
        </LynxTooltip>
        <Popover.Content className="max-w-sm">
          <Popover.Dialog className="gap-y-2 flex flex-col">
            <Popover.Arrow />
            <div className="gap-y-2 flex flex-col">
              <strong className="text-sm">Uninstall Package</strong>
              <p className="text-xs text-default-600">
                This runs pip uninstall for "{item.name}" in the selected Python environment. Code that imports this
                package may stop working until it is installed again.
              </p>
              <div className="rounded-md border border-danger/25 bg-danger/10 p-2">
                <p className="text-xs font-medium text-danger">Command preview</p>
                <p className="mt-1 break-all font-JetBrainsMono text-xs text-default-700">
                  "{pythonPath}" -m pip uninstall -y "{item.name}"
                </p>
                <p className="mt-2 text-xs font-medium text-danger">Package</p>
                <p className="mt-1 break-all font-JetBrainsMono text-xs text-default-700">{item.name}</p>
                <p className="mt-2 text-xs font-medium text-danger">Python executable</p>
                <p className="mt-1 break-all font-JetBrainsMono text-xs text-default-700">{pythonPath}</p>
              </div>
            </div>
            <Button size="sm" variant="danger" onPress={remove} fullWidth>
              Uninstall Package
            </Button>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>
      <PkgVersions item={item} updated={updated} pythonPath={pythonPath} />
    </div>
  );
}
