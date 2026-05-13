import {Button, Description, Dropdown, Label, Spinner} from '@heroui/react';
import {topToast} from '@lynx/layouts/ToastProviders';
import {getLastPathItem} from '@lynx_common/utils';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';

import {AssociateItem, PythonVenvSelectItem} from '../../../../../../cross/CrossExtTypes';
import pIpc from '../../../../../PIpc';
import {Env_Icon, Python_Icon} from '../../../../SvgIcons';
import {fetchAndSetPythonVenvs} from '../../../../UtilHooks';

type Props = {id: string; setPythonPath?: Dispatch<SetStateAction<string>>};

// TODO: show names for dropdown items (pythons or venvs)
export default function SelectEnv({id, setPythonPath}: Props) {
  const [list, setList] = useState<PythonVenvSelectItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const onPress = (python: PythonVenvSelectItem) => {
    const result: AssociateItem = {id, dir: python.dir, type: python.type};
    pIpc.addAssociate(result);
    pIpc
      .getExePathAssociate(result)
      .then(exePath => {
        if (setPythonPath && exePath) {
          setPythonPath(exePath);
          topToast.success(`${python.condaName || python.version} associated successfully!`);
        } else {
          console.warn('PythonToolkit: Exe path or setPythonPath is not defined.');
        }
      })
      .catch(e => {
        console.warn('PythonToolkit: Failed to get exe path: ', e);
      });
  };

  useEffect(() => {
    setIsLoading(true);
    fetchAndSetPythonVenvs(setList, setIsLoading);
  }, []);

  return isLoading ? (
    <div className="flex flex-col gap-y-2 mt-4 items-center">
      <Spinner size="lg" />
      <Description>Loading available pythons and venvs...</Description>
    </div>
  ) : (
    <Dropdown>
      <Button className="mt-4">Select Environment</Button>
      <Dropdown.Popover>
        <Dropdown.Menu items={list}>
          {item => (
            <Dropdown.Item
              onPress={() => onPress(item)}
              id={`${item.version}_${item.dir}`}
              className="flex flex-col items-start gap-0">
              <Label>
                {item.type === 'python' ? (
                  <span className="flex flex-row items-center gap-x-2">
                    <Python_Icon className="text-yellow-300" /> {item.version}
                  </span>
                ) : (
                  <span className="flex flex-row items-center gap-x-2">
                    <Env_Icon className="text-green-300" /> {item.version}
                  </span>
                )}
              </Label>
              <Description>{item.condaName || getLastPathItem(item.dir)}</Description>
            </Dropdown.Item>
          )}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
