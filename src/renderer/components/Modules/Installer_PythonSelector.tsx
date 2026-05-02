import {Alert, Description, Key, Label, ListBox, Select, Spinner} from '@heroui-v3/react';
import {SkipNext} from '@solar-icons/react-perf/Bold';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {PythonVenvSelectItem} from '../../../cross/CrossExtTypes';
import {PythonToolkitActions} from '../../reducer';
import {Env_Icon, Python_Icon} from '../SvgIcons';
import {fetchAndSetPythonVenvs} from '../UtilHooks';

export const Installer_PythonSelector = (
  id: string,
  addAssociate: (id: string, type: 'add' | 'remove', item?: PythonVenvSelectItem) => void,
) =>
  function Selector() {
    const dispatch = useDispatch();
    const [list, setList] = useState<PythonVenvSelectItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [selectedKey, setSelectedKey] = useState<Key | null>('skip');

    const onSelected = useCallback((item: PythonVenvSelectItem) => {
      const resultItem = {...item, id};
      dispatch(PythonToolkitActions.setSelectedPythonVenv(resultItem));
      addAssociate(id, 'add', item);
    }, []);

    useEffect(() => {
      setIsLoading(true);
      fetchAndSetPythonVenvs(setList, setIsLoading, onSelected);
    }, []);

    const onSelectionChange = (key: Key | null) => {
      if (!key || typeof key === 'number') return;

      if (key === 'skip') {
        addAssociate(id, 'remove');
        setSelectedKey(key);
      } else {
        const item = list.find(item => `${item.version}_${item.dir}` === key);

        if (item) {
          onSelected(item);
          setSelectedKey(key);
        }
      }
    };

    const items = useMemo(() => {
      return [
        <ListBox.Item id="skip" key="skip" textValue="Skip">
          <div className="flex flex-col">
            <Label className="flex flex-row items-center gap-x-2">
              <SkipNext className="size-4 text-semi-muted" />
              <span>Skip</span>
            </Label>
            <Description>
              Do not assign a specific environment. The LynxHub or system default will be used if required.
            </Description>
          </div>
        </ListBox.Item>,
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
            <ListBox.Item
              textValue={item.version}
              id={`${item.version}_${item.dir}`}
              key={`${item.version}_${item.dir}`}>
              <div className="flex flex-col">
                {item.type === 'python' ? (
                  <span className="flex flex-row items-center gap-x-2">
                    <Python_Icon className="text-yellow-300 size-4" /> {item.version}
                  </span>
                ) : (
                  <span className="flex flex-row items-center gap-x-2">
                    <Env_Icon className="text-green-300 size-4.5" /> {item.version}
                  </span>
                )}
                <Description>{description}</Description>
              </div>
            </ListBox.Item>
          );
        }),
      ];
    }, [list]);

    return (
      <div className="flex flex-col gap-y-4 py-4 size-full">
        <span className="flex flex-col gap-y-1">
          <Label>Select a Python Environment</Label>
          <Description>Choose which Python interpreter or virtual environment this tool should use.</Description>
        </span>

        {isLoading ? (
          <div className="flex w-full items-center justify-center flex-col gap-y-2">
            <Spinner size="lg" />
            <Description className="text-sm">Searching for python environments...</Description>
          </div>
        ) : (
          <Select
            defaultValue="skip"
            variant="secondary"
            value={selectedKey}
            selectionMode="single"
            onChange={onSelectionChange}>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>{items}</ListBox>
            </Select.Popover>
          </Select>
        )}

        <Alert status="accent" className="bg-surface-secondary shadow-none">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Don't see the environment you need?</Alert.Title>
            <Alert.Description>
              Use the Python Toolkit in the Tools page to install new Python versions or create virtual environments.
              You can then return here to select it.
            </Alert.Description>
          </Alert.Content>
        </Alert>
      </div>
    );
  };
