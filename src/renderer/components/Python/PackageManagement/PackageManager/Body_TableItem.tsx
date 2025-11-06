import {Button} from '@heroui/react';
import {message} from 'antd';
import {capitalize, startCase} from 'lodash';
import {useCallback, useMemo, useState} from 'react';

import {PackageInfo} from '../../../../../cross/CrossExtTypes';
import {getUpdateVersionColor} from '../../../../../cross/CrossExtUtils';
import pIpc from '../../../../PIpc';
import {usePythonToolkitState} from '../../../../reducer';
import {Warn_Icon} from '../../../SvgIcons';
import ActionButtons from './ActionButtons';

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
    pIpc
      .updatePackage(pythonPath, item.name, item.updateVersion)
      .then(() => {
        updated(item.name, item.updateVersion!);
        message.success(`Package "${item.name}" updated successfully.`);
      })
      .catch(() => {
        message.error(`Failed to update package "${item.name}".`);
      })
      .finally(() => {
        setIsUpdating(false);
      });
  }, [item]);

  if (columnKey === 'actions') {
    return (
      !isUpdating && (
        <ActionButtons
          item={item}
          updated={updated}
          removed={removed}
          pythonPath={pythonPath}
          isUninstalling={isUninstalling}
          setIsUninstalling={setIsUninstalling}
        />
      )
    );
  } else if (columnKey === 'update') {
    return (
      !isSelected &&
      !isUninstalling &&
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
          <div className="text-bold text-sm">
            <div className="flex flex-row items-center gap-x-1 text-medium font-semibold">
              <span>{itemName}</span>
              {item.updateVersion && (
                <Warn_Icon className={`${getUpdateVersionColor(item.version, item.updateVersion)} size-[1.1rem]`} />
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
      </>
    );
  }

  return null;
}
