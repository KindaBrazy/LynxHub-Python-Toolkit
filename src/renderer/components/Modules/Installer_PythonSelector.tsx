import {Alert, CircularProgress, Select, SelectItem, SharedSelection} from '@heroui/react';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {PythonVenvSelectItem} from '../../../cross/CrossExtTypes';
import pIpc from '../../PIpc';
import {PythonToolkitActions, usePythonToolkitState} from '../../reducer';
import {Packages_Icon, Python_Icon} from '../SvgIcons';

export const Installer_PythonSelector = (
  id: string,
  setTerminalCommand: (id: string, item: PythonVenvSelectItem) => void,
) =>
  function Selector() {
    const dispatch = useDispatch();
    const selected = usePythonToolkitState('pythonVenvSelected');
    const [list, setList] = useState<PythonVenvSelectItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const onSelected = useCallback((item: PythonVenvSelectItem) => {
      const resultItem = {...item, id};
      dispatch(PythonToolkitActions.setSelectedPythonVenv(resultItem));
      setTerminalCommand(id, item);
    }, []);

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

          if (combined.length > 0) onSelected(combined[0]);
        })
        .finally(() => setIsLoading(false));
    }, []);

    const onSelectionChange = (keys: SharedSelection) => {
      const item = list.find(item => item.label === Array.from(keys)[0]);

      if (item) onSelected(item);
    };

    return (
      <div className="flex flex-col gap-y-4 py-4 size-full">
        {/* Title */}
        <h2 className="text-lg font-semibold">Select Python or Virtual Environment</h2>
        <p className="text-sm text-foreground-400">
          Choose the Python interpreter or virtual environment you want to use.
        </p>

        {isLoading ? (
          <div className="flex w-full items-center justify-center">
            <CircularProgress size="lg" label="Loading available pythons and venvs..." />
          </div>
        ) : (
          <Select
            items={list}
            selectedKeys={[selected.label]}
            label="Python / Virtual Environment"
            onSelectionChange={onSelectionChange}
            disallowEmptySelection>
            {item => (
              <SelectItem key={item.label} textValue={item.label}>
                {item.type === 'python' ? (
                  <span className="flex flex-row items-center gap-x-2">
                    <Python_Icon className="text-primary/70" /> Python {item.label}
                  </span>
                ) : (
                  <span className="flex flex-row items-center gap-x-2">
                    <Packages_Icon className="text-secondary/70" /> {item.label}
                  </span>
                )}
              </SelectItem>
            )}
          </Select>
        )}

        {/* Extra Note */}
        <Alert
          title={
            'If you need to install Python or create a virtual environment, open the Python Toolkit' +
            ' window in the tools page. Once done, return here and select your desired interpreter.'
          }
          color="primary"
          variant="faded"
        />
      </div>
    );
  };
