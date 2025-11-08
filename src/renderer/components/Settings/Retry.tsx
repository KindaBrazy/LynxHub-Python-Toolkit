import {NumberInput} from '@heroui/react';
import {debounce} from 'lodash';
import {useEffect, useMemo, useState} from 'react';

import pIpc from '../../PIpc';

export default function Retry() {
  const [value, setValue] = useState<number>(5);

  const debouncedSetMaxRetry = useMemo(() => debounce((value: number) => pIpc.setMaxRetry(value), 500), []);

  const onValueChange = (value: number) => {
    setValue(value);
    debouncedSetMaxRetry(value);
  };

  useEffect(() => {
    pIpc.getMaxRetry().then(result => {
      setValue(result);
    });

    return () => {
      debouncedSetMaxRetry.cancel();
    };
  }, [debouncedSetMaxRetry]);

  return (
    <NumberInput
      size="sm"
      minValue={1}
      value={value}
      maxValue={100}
      defaultValue={0}
      onValueChange={onValueChange}
      label="Max Package Update Retries"
      description="Set the maximum number of attempts for a failed package update check. (Default is 5)"
    />
  );
}
