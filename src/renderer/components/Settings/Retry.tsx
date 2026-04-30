import {Description, Label, NumberField} from '@heroui-v3/react';
import {debounce} from 'lodash-es';
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
    <NumberField minValue={1} value={value} defaultValue={1} variant="secondary" onChange={onValueChange} fullWidth>
      <Label>Max Package Update Retries</Label>
      <NumberField.Group>
        <NumberField.DecrementButton />
        <NumberField.Input />
        <NumberField.IncrementButton />
      </NumberField.Group>
      <Description>Set the maximum number of attempts for a failed package update check. (Default is 5)</Description>
    </NumberField>
  );
}
