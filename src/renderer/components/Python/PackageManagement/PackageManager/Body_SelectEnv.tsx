import {Button, CircularProgress, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from '@heroui/react';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {lynxTopToast} from '../../../../../../../src/renderer/src/App/Utils/UtilHooks';
import {AssociateItem, PythonVenvSelectItem} from '../../../../../cross/CrossExtTypes';
import pIpc from '../../../../PIpc';
import {Packages_Icon, Python_Icon} from '../../../SvgIcons';

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
          lynxTopToast(dispatch).success(`${python.label} associated successfully!`);
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
    Promise.all([pIpc.getInstalledPythons(false), pIpc.getVenvs()])
      .then(([pythons, venvs]) => {
        const pythonItems: PythonVenvSelectItem[] = pythons.map(python => ({
          label: python.version,
          dir: python.installFolder,
          type: 'python',
        }));
        const venvItems: PythonVenvSelectItem[] = venvs.map(venv => ({
          label: venv.name,
          dir: venv.folder,
          type: 'venv',
        }));

        const combined = [...pythonItems, ...venvItems];
        setList(combined);
      })
      .finally(() => setIsLoading(false));
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
          <DropdownItem key={item.label} onPress={() => onPress(item)}>
            <div className="flex flex-row gap-x-1 items-end">
              {item.type === 'python' ? (
                <span className="flex flex-row items-center gap-x-2">
                  <Python_Icon className="text-primary/70" /> Python {item.label}
                </span>
              ) : (
                <span className="flex flex-row items-center gap-x-2">
                  <Packages_Icon className="text-secondary/70" /> {item.label}
                </span>
              )}
            </div>
          </DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}
