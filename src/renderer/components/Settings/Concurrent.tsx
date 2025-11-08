import {NumberInput} from '@heroui/react';
import {debounce} from 'lodash';
import {useEffect, useMemo, useState} from 'react';

import pIpc from '../../PIpc';

export default function Concurrent() {
  const [value, setValue] = useState<number>(0);

  const debouncedSetMax = useMemo(() => debounce((value: number) => pIpc.setMaxConcurrent(value), 500), []);

  const onValueChange = (value: number) => {
    setValue(value);
    debouncedSetMax(value);
  };

  useEffect(() => {
    pIpc.getMaxConcurrent().then(result => {
      setValue(result);
    });

    return () => {
      debouncedSetMax.cancel();
    };
  }, [debouncedSetMax]);

  return (
    <NumberInput
      size="sm"
      minValue={0}
      value={value}
      maxValue={100}
      defaultValue={0}
      onValueChange={onValueChange}
      label="Maximum Concurrent Update Checks"
      description="Limit the number of simultaneous update checks. Set to 0 for no limit."
    />
  );
}
