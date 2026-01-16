import {
  ModalBody,
  Selection,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react';
import {Result} from 'antd';
import {cloneDeep, isEmpty} from 'lodash';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {Dispatch, SetStateAction, useMemo} from 'react';

import {useAppState} from '../../../../../../../../src/renderer/main_window/redux/reducers/app';
import {PackageInfo, PackageUpdate, SitePackages_Info} from '../../../../../../cross/CrossExtTypes';
import SelectEnv from './SelectEnv';
import TableItem from './TableItem';

type Props = {
  id: string;
  items: PackageInfo[];
  isLoading: boolean;
  pythonPath: string;
  updated: (list: PackageUpdate | PackageUpdate[]) => void;
  removed: (name: string) => void;
  isValidPython: boolean;
  packagesUpdate: SitePackages_Info[];
  selectedKeys: Selection;
  setSelectedKeys: Dispatch<SetStateAction<Selection>>;
  setPythonPath?: Dispatch<SetStateAction<string>>;
  setIsUpdateTerminalOpen: Dispatch<SetStateAction<boolean>>;
  show: string;
};

export default function PackageManagerBody({
  id,
  items,
  isLoading,
  pythonPath,
  updated,
  removed,
  isValidPython,
  setSelectedKeys,
  packagesUpdate,
  selectedKeys,
  setPythonPath,
  setIsUpdateTerminalOpen,
  show,
}: Props) {
  const isDarkMode = useAppState('darkMode');
  const anyUpdateAvailable = useMemo(() => packagesUpdate.length !== 0, [packagesUpdate]);

  const disabledKeys = useMemo(() => {
    if (isEmpty(packagesUpdate)) return [];
    return items.filter(item => !packagesUpdate.some(update => update.name === item.name)).map(item => item.name);
  }, [items, packagesUpdate]);

  const columns = useMemo(() => {
    const data = [
      {key: 'name', label: 'Name'},
      {key: 'actions', label: 'Actions'},
    ];

    if (anyUpdateAvailable) data.splice(1, 0, {key: 'update', label: 'Update'});

    return data;
  }, [anyUpdateAvailable]);

  const refreshedItems = useMemo(() => cloneDeep(items), [items, selectedKeys]);

  return (
    <ModalBody
      options={{
        overflow: {x: 'hidden', y: 'scroll'},
        scrollbars: {
          autoHide: 'move',
          clickScroll: true,
          theme: isDarkMode ? 'os-theme-light' : 'os-theme-dark',
        },
      }}
      className="size-full p-4"
      as={OverlayScrollbarsComponent}>
      <div className="w-full flex flex-col gap-y-4">
        <div className="flex flex-row gap-8 flex-wrap justify-center">
          {isLoading ? (
            <Spinner
              size="lg"
              className="mb-4"
              label="Please wait, loading package data..."
              classNames={{circle2: 'border-b-[#ffe66e]', circle1: 'border-b-[#ffe66e] '}}
            />
          ) : isValidPython ? (
            <>
              <Table
                color="success"
                aria-label="pacakges"
                disabledKeys={disabledKeys}
                selectedKeys={selectedKeys}
                onSelectionChange={setSelectedKeys}
                selectionMode={anyUpdateAvailable ? 'multiple' : 'none'}
                classNames={{wrapper: 'bg-foreground-200 dark:bg-black/50'}}>
                <TableHeader columns={columns}>
                  {column => <TableColumn key={column.key}>{column.label}</TableColumn>}
                </TableHeader>
                <TableBody items={refreshedItems}>
                  {item => (
                    <TableRow key={item.name}>
                      {columnKey => (
                        <TableCell>
                          <TableItem
                            show={show}
                            item={item}
                            removed={removed}
                            updated={updated}
                            pythonPath={pythonPath}
                            columnKey={columnKey as string}
                            setIsUpdateTerminalOpen={setIsUpdateTerminalOpen}
                            isSelected={selectedKeys === 'all' || selectedKeys.has(item.name)}
                          />
                        </TableCell>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </>
          ) : (
            <Result
              status="404"
              title="Could not find a virtual environment."
              extra={<SelectEnv id={id} setPythonPath={setPythonPath} />}
              subTitle={<span>Please select your desire environment.</span>}
            />
          )}
        </div>
      </div>
    </ModalBody>
  );
}
