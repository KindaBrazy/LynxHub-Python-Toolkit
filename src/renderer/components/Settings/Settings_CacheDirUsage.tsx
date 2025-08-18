import {Button} from '@heroui/react';
import {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import LynxSwitch from '../../../../../src/renderer/src/App/Components/Reusable/LynxSwitch';
import {lynxTopToast} from '../../../../../src/renderer/src/App/Utils/UtilHooks';
import {BroomDuo_Icon} from '../../../../../src/renderer/src/assets/icons/SvgIcons/SvgIcons';
import {FolderDiskUsage_StorageID} from '../../../cross/CrossExtConstants';
import pIpc from '../../PIpc';
import {PythonToolkitActions, usePythonToolkitState} from '../../reducer';

export default function Settings_CacheDirUsage() {
  const cacheStorageUsage = usePythonToolkitState('cacheStorageUsage');
  const [clearing, setClearing] = useState<boolean>(false);

  const dispatch = useDispatch();

  const updateValue = (value: boolean) => {
    dispatch(PythonToolkitActions.setCacheStorageUsage(value));
  };

  useEffect(() => {
    pIpc.getCacheStorageUsage().then(updateValue);
  }, []);

  const onEnabledChange = (value: boolean) => {
    pIpc.setCacheStorageUsage(value);
    updateValue(value);
  };

  const clearCache = () => {
    setClearing(true);
    const prefix = FolderDiskUsage_StorageID;

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));

    setTimeout(() => {
      setClearing(false);
      lynxTopToast(dispatch).success('Disk usage cache cleared successfully');
    }, 700);
  };

  return (
    <div className="w-full flex flex-row gap-x-2">
      <LynxSwitch
        description={
          'When disabled, disk usage is recalculated every time you open toolkit window, which can take longer' +
          ' depending on installed packages.'
        }
        title="Cache Disk Usage"
        enabled={cacheStorageUsage}
        onEnabledChange={onEnabledChange}
      />
      <div className="flex flex-col items-center justify-center gap-y-1">
        <Button
          variant="flat"
          isLoading={clearing}
          onPress={clearCache}
          className="h-14 shrink-0"
          isDisabled={!cacheStorageUsage}
          startContent={!clearing && <BroomDuo_Icon />}
          fullWidth>
          {!clearing ? 'Clear Cache' : 'Clearing...'}
        </Button>
        <span className="text-tiny text-default-400 text-center">Clear the cache to refresh usage statistics.</span>
      </div>
    </div>
  );
}
