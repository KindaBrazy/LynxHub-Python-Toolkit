import {Alert, Button, Description, Key, Label, ListBox, Select, Spinner} from '@heroui/react';
import {SkipNext} from '@solar-icons/react-perf/Bold';
import {Restart} from '@solar-icons/react-perf/BoldDuotone';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {PythonVenvSelectItem} from '../../../cross/CrossExtTypes';
import {PythonToolkitActions} from '../../reducer';
import {getUniqueLabels} from '../../Utils';
import {PythonIcon} from '../SvgIcons';
import {fetchAndSetPythonVenvs} from '../UtilHooks';

type ListWithLabel = PythonVenvSelectItem & {label: string};

export const Installer_PythonSelector = (
  id: string,
  addAssociate: (id: string, type: 'add' | 'remove', item?: PythonVenvSelectItem) => void,
) =>
  function Selector() {
    const dispatch = useDispatch();
    const [list, setList] = useState<ListWithLabel[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [selectedKey, setSelectedKey] = useState<Key | null>('skip');

    const onSelected = useCallback((item: PythonVenvSelectItem) => {
      const resultItem = {...item, id};
      dispatch(PythonToolkitActions.setSelectedPythonVenv(resultItem));
      addAssociate(id, 'add', item);
    }, []);

    const fetchList = useCallback(() => {
      setIsLoading(true);
      fetchAndSetPythonVenvs(
        items => {
          if (items.length > 0) {
            const labels = getUniqueLabels(items.map(item => item.dir));
            const updated = items.map((item, idx) => ({
              ...item,
              label: labels[idx],
            }));
            setList(updated);
          } else {
            setList([]);
          }
        },
        setIsLoading,
        onSelected,
      );
    }, []);

    useEffect(() => fetchList(), []);

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
            lynx: <span className="text-accent">LynxHub Default</span>,
            system: <span className="text-LynxPurple">System Default</span>,
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
                    <PythonIcon className="text-blue-400 size-4" /> {item.version}
                  </span>
                ) : (
                  <span className="flex flex-row items-center gap-x-2">
                    <PythonIcon className="text-yellow-400 size-4.5" /> {item.version}
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
          <div className="w-full flex items-center gap-x-2">
            <Select
              defaultValue="skip"
              variant="secondary"
              value={selectedKey}
              selectionMode="single"
              onChange={onSelectionChange}
              fullWidth>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>{items}</ListBox>
              </Select.Popover>
            </Select>
            <Button variant="tertiary" onPress={fetchList}>
              <Restart />
              Refresh
            </Button>
          </div>
        )}

        <Alert className="bg-surface-secondary shadow-none">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Don't see the environment you need?</Alert.Title>
            <Alert.Description className="text-sm">
              Use the Python Toolkit in the Tools page to install new Python versions or create virtual environments.
            </Alert.Description>
          </Alert.Content>
        </Alert>
      </div>
    );
  };
