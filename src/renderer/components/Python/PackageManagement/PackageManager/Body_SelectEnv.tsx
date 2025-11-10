import {Button, CircularProgress, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from '@heroui/react';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {lynxTopToast} from '../../../../../../../src/renderer/src/App/Utils/UtilHooks';
import {AssociateItem, PythonVenvSelectItem} from '../../../../../cross/CrossExtTypes';
import pIpc from '../../../../PIpc';
import {Env_Icon, Python_Icon} from '../../../SvgIcons';
import {fetchAndSetPythonVenvs} from '../../../UtilHooks';

type Props = {id: string; setPythonPath?: Dispatch<SetStateAction<string>>};

export default function Body_SelectEnv({id, setPythonPath}: Props) {
  const [list, setList] = useState<PythonVenvSelectItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const dispatch = useDispatch();

  const onPress = (python: PythonVenvSelectItem) => {
    const result: AssociateItem = {id, dir: python.dir, type: python.type};
    pIpc.addAssociate(result);
    pIpc
      .getExePathAssociate(result)
      .then(exePath => {
        if (setPythonPath && exePath) {
          setPythonPath(exePath);
          lynxTopToast(dispatch).success(`${python.condaName || python.version} associated successfully!`);
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
    <CircularProgress
      color="secondary"
      className="justify-self-center"
      label="Loading available pythons and venvs..."
    />
  ) : (
    <Dropdown size="md" showArrow>
      <DropdownTrigger>
        <Button color="secondary" key="select_python_version">
          Select Environment
        </Button>
      </DropdownTrigger>
      <DropdownMenu items={list}>
        {item => (
          <DropdownItem onPress={() => onPress(item)} key={`${item.version}_${item.dir}`}>
            <div className="flex flex-row gap-x-1 items-end">
              {item.type === 'python' ? (
                <span className="flex flex-row items-center gap-x-2">
                  <Python_Icon className="text-yellow-300" /> {item.version}
                </span>
              ) : (
                <span className="flex flex-row items-center gap-x-2">
                  <Env_Icon className="text-green-300" /> {item.version}
                </span>
              )}
            </div>
          </DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}
