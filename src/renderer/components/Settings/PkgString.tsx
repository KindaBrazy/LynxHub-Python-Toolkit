import {Description, Label, Radio, RadioGroup} from '@heroui-v3/react';
import {capitalize, startCase} from 'lodash-es';
import {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {AppDispatch} from '../../../../../src/renderer/mainWindow/redux/store';
import {PkgDisplayType} from '../../../cross/CrossExtTypes';
import pIpc from '../../PIpc';
import {PythonToolkitActions} from '../../reducer';

const exampleName = 'azure-storage-blob';

export default function PkgString() {
  const [value, setValue] = useState<PkgDisplayType>('default');
  const [exampleResult, setExampleResult] = useState<string>(exampleName);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    pIpc.getPkgDisplay().then(result => setValue(result));
  }, []);

  const onValueChange = (valueText: PkgDisplayType) => {
    setValue(valueText);
    switch (valueText) {
      case 'capitalize':
        setExampleResult(capitalize(exampleName));
        break;
      case 'startCase':
        setExampleResult(startCase(exampleName));
        break;
      case 'default':
      default:
        setExampleResult(exampleName);
        break;
    }
    dispatch(PythonToolkitActions.setPkgDisplay(valueText));
    pIpc.setPkgDisplay(valueText);
  };

  return (
    <div className="flex flex-col gap-2">
      <Label>
        <span>Package Name Display Format.</span>
        <span className="text-success"> Example: {exampleResult}</span>
      </Label>
      <RadioGroup
        value={value}
        variant="secondary"
        defaultValue="default"
        onChange={onValueChange}
        orientation="horizontal">
        <Radio value="default">
          <Radio.Control>
            <Radio.Indicator />
          </Radio.Control>
          <Radio.Content>
            <Label>Default</Label>
          </Radio.Content>
        </Radio>
        <Radio value="capitalize">
          <Radio.Control>
            <Radio.Indicator />
          </Radio.Control>
          <Radio.Content>
            <Label>Capitalize</Label>
          </Radio.Content>
        </Radio>
        <Radio value="startCase">
          <Radio.Control>
            <Radio.Indicator />
          </Radio.Control>
          <Radio.Content>
            <Label>Start Case</Label>
          </Radio.Content>
        </Radio>
      </RadioGroup>
      <Description>
        This setting changes how package names are displayed in the package manager. It has no effect on functionality.
      </Description>
    </div>
  );
}
