import {Button} from '@heroui-v3/react';
import {topToast} from '@lynx/layouts/ToastProviders';
import {Broom} from '@solar-icons/react-perf/BoldDuotone';
import {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import LynxSwitch from '../../../../../src/renderer/mainWindow/components/LynxSwitch';
import pIpc from '../../PIpc';
import {PythonToolkitActions, usePythonToolkitState} from '../../reducer';

export default function CacheDirUsage() {
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

    pIpc.storage.clearCachedUsage();

    setTimeout(() => {
      setClearing(false);
      topToast.success('Disk usage cache cleared successfully');
    }, 700);
  };

  return (
    <div className="w-full flex flex-col gap-y-2">
      <LynxSwitch
        description={
          'When disabled, disk usage is recalculated every time you open toolkit window, which can take longer' +
          ' depending on installed packages.'
        }
        title="Cache Disk Usage"
        enabled={cacheStorageUsage}
        onEnabledChange={onEnabledChange}
      />
      <Button
        isPending={clearing}
        onPress={clearCache}
        className="shrink-0"
        variant="danger-soft"
        isDisabled={!cacheStorageUsage}
        fullWidth>
        {!clearing && <Broom />}
        {!clearing ? 'Clear Cache' : 'Clearing...'}
      </Button>
    </div>
  );
}
