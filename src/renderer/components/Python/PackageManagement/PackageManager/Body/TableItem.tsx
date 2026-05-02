import {Button, TableCell} from '@heroui-v3/react';
import {topToast} from '@lynx/layouts/ToastProviders';
import {ShieldWarning} from '@solar-icons/react-perf/BoldDuotone';
import {capitalize, startCase} from 'lodash-es';
import {useCallback, useMemo, useState} from 'react';

import {PackageInfo, PackageUpdate} from '../../../../../../cross/CrossExtTypes';
import {getUpdateVersionColor} from '../../../../../../cross/CrossExtUtils';
import pIpc from '../../../../../PIpc';
import {usePythonToolkitState} from '../../../../../reducer';
import ActionButtons from './ActionButtons';

type Props = {
  item: PackageInfo;
  pythonPath: string;
  updated: (list: PackageUpdate | PackageUpdate[]) => void;
  removed: (name: string) => void;
  columnKey: string;
  isSelected: boolean;
  setIsUpdateTerminalOpen: (value: boolean) => void;
};

export default function TableItem({
  item,
  pythonPath,
  updated,
  removed,
  columnKey,
  isSelected,
  setIsUpdateTerminalOpen,
}: Props) {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isUninstalling, setIsUninstalling] = useState<boolean>(false);
  const pkgNameDisplay = usePythonToolkitState('pkgNameDisplay');

  const itemName = useMemo(() => {
    switch (pkgNameDisplay) {
      case 'capitalize':
        return capitalize(item.name);
      case 'startCase':
        return startCase(item.name);
      case 'default':
      default:
        return item.name;
    }
  }, [item, pkgNameDisplay]);

  const update = useCallback(() => {
    setIsUpdating(true);
    setIsUpdateTerminalOpen(true);
    pIpc
      .updatePackage(pythonPath, item.name, item.updateVersion)
      .then(() => {
        updated(item);
        topToast.success(`Package "${item.name}" updated successfully.`);
      })
      .catch(() => {
        topToast.danger(`Failed to update package "${item.name}".`);
      })
      .finally(() => {
        setIsUpdating(false);
      });
  }, [item]);

  if (columnKey === 'actions') {
    return !isUpdating ? (
      <TableCell>
        <ActionButtons
          item={item}
          updated={updated}
          removed={removed}
          pythonPath={pythonPath}
          isUninstalling={isUninstalling}
          setIsUninstalling={setIsUninstalling}
        />
      </TableCell>
    ) : (
      <TableCell />
    );
  } else if (columnKey === 'update') {
    return !isSelected && !isUninstalling && item.updateVersion ? (
      <TableCell>
        <Button size="sm" onPress={update} isPending={isUpdating}>
          {isUpdating ? 'Updating...' : 'Update'}
        </Button>
      </TableCell>
    ) : (
      <TableCell />
    );
  } else if (columnKey === 'name') {
    return (
      <TableCell>
        <div className="flex flex-col">
          <div className="text-bold text-sm">
            <div className="flex flex-row items-center gap-x-1 text-medium font-semibold">
              <span>{itemName}</span>
              {item.updateVersion && (
                <ShieldWarning className={`${getUpdateVersionColor(item.version, item.updateVersion)} size-[1.1rem]`} />
              )}
            </div>
          </div>
          <div className="text-bold text-sm text-default-400">
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
      </TableCell>
    );
  }

  return null;
}
