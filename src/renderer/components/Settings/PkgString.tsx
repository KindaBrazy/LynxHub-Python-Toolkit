import {Radio, RadioGroup} from '@heroui/react';
import {capitalize, startCase} from 'lodash';
import {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {AppDispatch} from '../../../../../src/renderer/src/App/Redux/Store';
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
    <RadioGroup
      description={`This setting changes how package names are displayed in the
       package manager. It has no effect on functionality.`}
      label={
        <div>
          Package Name Display Format.
          <span className="text-success/70"> Example: {exampleResult}</span>
        </div>
      }
      value={value}
      orientation="horizontal"
      onValueChange={onValueChange}>
      <Radio value="default">Default</Radio>
      <Radio value="capitalize">Capitalize</Radio>
      <Radio value="startCase">Start Case</Radio>
    </RadioGroup>
  );
}
