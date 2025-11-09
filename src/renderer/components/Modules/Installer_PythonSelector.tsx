import {Alert, CircularProgress, Select, SelectItem, SharedSelection} from '@heroui/react';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {PythonVenvSelectItem} from '../../../cross/CrossExtTypes';
import {PythonToolkitActions} from '../../reducer';
import {Env_Icon, Python_Icon, SkipDuo_Icon} from '../SvgIcons';
import {fetchAndSetPythonVenvs} from '../UtilHooks';

export const Installer_PythonSelector = (
  id: string,
  addAssociate: (id: string, type: 'add' | 'remove', item?: PythonVenvSelectItem) => void,
) =>
  function Selector() {
    const dispatch = useDispatch();
    const [list, setList] = useState<PythonVenvSelectItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const onSelected = useCallback((item: PythonVenvSelectItem) => {
      const resultItem = {...item, id};
      dispatch(PythonToolkitActions.setSelectedPythonVenv(resultItem));
      addAssociate(id, 'add', item);
    }, []);

    useEffect(() => {
      setIsLoading(true);
      fetchAndSetPythonVenvs(setList, setIsLoading, onSelected);
    }, []);

    const onSelectionChange = (keys: SharedSelection) => {
      const targetKey = Array.from(keys)[0];
      if (targetKey === 'skip') {
        addAssociate(id, 'remove');
      } else {
        const item = list.find(item => `${item.version}_${item.dir}` === Array.from(keys)[0]);

        if (item) onSelected(item);
      }
    };

    const items = useMemo(() => {
      return [
        <SelectItem
          key="skip"
          textValue="Skip"
          description="Do not assign a specific environment. The LynxHub or system default will be used if required.">
          <span className="flex flex-row items-center gap-x-2">
            <SkipDuo_Icon className="text-danger size-4" /> Skip
          </span>
        </SelectItem>,
        ...list.map(item => {
          const defaultTextMap = {
            lynx: <span className="text-primary-500">LynxHub Default</span>,
            system: <span className="text-secondary-500">System Default</span>,
          };

          const nameText = item.condaName;
          const defaultTextNode = item.isDefault ? defaultTextMap[item.isDefault] : null;

          const description = (
            <>
              {nameText}
              {nameText && defaultTextNode && <span className="mx-2">|</span>}
              {defaultTextNode}
            </>
          );

          return (
            <SelectItem textValue={item.version} description={description} key={`${item.version}_${item.dir}`}>
              {item.type === 'python' ? (
                <span className="flex flex-row items-center gap-x-2">
                  <Python_Icon className="text-yellow-300 size-4" /> {item.version}
                </span>
              ) : (
                <span className="flex flex-row items-center gap-x-2">
                  <Env_Icon className="text-green-300 size-4.5" /> {item.version}
                </span>
              )}
            </SelectItem>
          );
        }),
      ];
    }, [list]);

    return (
      <div className="flex flex-col gap-y-4 py-4 size-full">
        <h2 className="text-lg font-semibold">Select a Python Environment</h2>
        <p className="text-sm text-foreground-400">
          Choose which Python interpreter or virtual environment this tool should use.
        </p>

        {isLoading ? (
          <div className="flex w-full items-center justify-center">
            <CircularProgress size="lg" label="Searching for Python environments..." />
          </div>
        ) : (
          <Select
            label="Python Environment"
            defaultSelectedKeys={[`skip`]}
            onSelectionChange={onSelectionChange}
            disallowEmptySelection>
            {items}
          </Select>
        )}

        <Alert
          description={
            'Use the Python Toolkit on the Tools page to install new Python versions' +
            ' or create virtual environments. You can then return here to select it.'
          }
          color="primary"
          variant="faded"
          title="Don't see the environment you need?"
        />
      </div>
    );
  };
