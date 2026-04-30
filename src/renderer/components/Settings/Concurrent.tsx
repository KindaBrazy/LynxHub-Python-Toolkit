import {Description, Label, NumberField} from '@heroui-v3/react';
import {debounce} from 'lodash-es';
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
    <NumberField
      minValue={0}
      value={value}
      maxValue={100}
      defaultValue={0}
      variant="secondary"
      onChange={onValueChange}
      fullWidth>
      <Label>Maximum Concurrent Update Checks</Label>
      <NumberField.Group>
        <NumberField.DecrementButton />
        <NumberField.Input />
        <NumberField.IncrementButton />
      </NumberField.Group>
      <Description>Limit the number of simultaneous update checks. Set to 0 for no limit.</Description>
    </NumberField>
  );
}
