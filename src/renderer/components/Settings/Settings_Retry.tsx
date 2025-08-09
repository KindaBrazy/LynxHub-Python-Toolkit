import {NumberInput} from '@heroui/react';
import {debounce} from 'lodash';
import {useCallback, useEffect, useState} from 'react';

import pIpc from '../../PIpc';

export default function Settings_Retry() {
  const [value, setValue] = useState<number>(5);

  const debouncedSetMaxRetry = useCallback(
    debounce((value: number) => pIpc.setMaxRetry(value), 500),
    [],
  );

  const onValueChange = (value: number) => {
    setValue(value);
    debouncedSetMaxRetry(value);
  };

  useEffect(() => {
    pIpc.getMaxRetry().then(result => {
      setValue(result);
    });
  }, []);

  return (
    <NumberInput
      minValue={1}
      value={value}
      maxValue={50}
      defaultValue={0}
      onValueChange={onValueChange}
      label="Max Package Update Retries"
      description="Set the maximum number of attempts for a failed package update check. (Default is 5)"
    />
  );
}
