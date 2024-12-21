import {
  Button,
  ModalBody,
  Selection,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';
import {Result} from 'antd';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {Dispatch, SetStateAction, useMemo} from 'react';

import {PackageInfo} from '../../../../../../cross/extension/CrossExtTypes';
import {useAppState} from '../../../../../src/App/Redux/App/AppReducer';
import Body_TableItem from './Body_TableItem';

type Props = {
  items: PackageInfo[];
  isLoading: boolean;
  pythonPath: string;
  updated: (name: string, newVersion: string) => void;
  removed: (name: string) => void;
  isValidPython: boolean;
  locateVenv?: () => void;
  isLocating?: boolean;
  anyUpdateAvailable: boolean;
  selectedKeys: Selection;
  setSelectedKeys: Dispatch<SetStateAction<Selection>>;
};

export default function PackageManagerBody({
  items,
  isLoading,
  pythonPath,
  updated,
  removed,
  isValidPython,
  isLocating,
  locateVenv,
  anyUpdateAvailable,
  setSelectedKeys,
  selectedKeys,
}: Props) {
  const isDarkMode = useAppState('darkMode');

  const columns = useMemo(() => {
    const data = [
      {key: 'name', label: 'Name'},
      {key: 'actions', label: 'Actions'},
    ];

    if (anyUpdateAvailable) data.splice(1, 0, {key: 'update', label: 'Update'});

    return data;
  }, [anyUpdateAvailable]);

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
              label="Loading packages data, please wait..."
              classNames={{circle2: 'border-b-[#ffe66e]', circle1: 'border-b-[#ffe66e] '}}
            />
          ) : isValidPython ? (
            <>
              <Table
                color="success"
                aria-label="pacakges"
                selectedKeys={selectedKeys}
                onSelectionChange={setSelectedKeys}
                selectionMode={anyUpdateAvailable ? 'multiple' : 'none'}
                classNames={{wrapper: 'bg-foreground-200 dark:bg-black/50'}}>
                <TableHeader columns={columns}>
                  {column => <TableColumn key={column.key}>{column.label}</TableColumn>}
                </TableHeader>
                <TableBody items={items}>
                  {item => (
                    <TableRow key={item.name}>
                      {columnKey => (
                        <TableCell>
                          <Body_TableItem
                            item={item}
                            removed={removed}
                            updated={updated}
                            pythonPath={pythonPath}
                            columnKey={columnKey as string}
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
              extra={
                <Button color="primary" key="locate_venv" onPress={locateVenv} isLoading={isLocating}>
                  {!isLocating && 'Locate Venv'}
                </Button>
              }
              subTitle="Also you can create virtual environment with Python Toolkit in tools page"
              title={`Could not find any venv for selected AI, Please locate a folder if you changed the venv folder.`}
            />
          )}
        </div>
      </div>
    </ModalBody>
  );
}
