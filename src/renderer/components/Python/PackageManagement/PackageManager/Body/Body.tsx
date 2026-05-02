import {Checkbox, Description, ModalBody, Selection, Spinner, Table} from '@heroui-v3/react';
import EmptyStateCard from '@lynx/components/EmptyStateCard';
import {cloneDeep, isEmpty} from 'lodash-es';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {Dispatch, SetStateAction, useMemo} from 'react';

import {useAppState} from '../../../../../../../../src/renderer/mainWindow/redux/reducers/app';
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
}: Props) {
  const isDarkMode = useAppState('darkMode');
  const anyUpdateAvailable = useMemo(() => packagesUpdate.length !== 0, [packagesUpdate]);

  const disabledKeys = useMemo(() => {
    if (isEmpty(packagesUpdate)) return [];
    return items.filter(item => !packagesUpdate.some(update => update.name === item.name)).map(item => item.name);
  }, [items, packagesUpdate]);

  const refreshedItems = useMemo(() => cloneDeep(items), [items, selectedKeys, anyUpdateAvailable]);

  return (
    <ModalBody>
      <OverlayScrollbarsComponent
        options={{
          overflow: {x: 'hidden', y: 'scroll'},
          scrollbars: {
            autoHide: 'move',
            clickScroll: true,
            theme: isDarkMode ? 'os-theme-light' : 'os-theme-dark',
          },
        }}
        className="size-full px-4">
        <div className="w-full flex flex-col gap-y-4">
          <div className="flex flex-row gap-8 flex-wrap justify-center">
            {isLoading ? (
              <div className="flex flex-col gap-y-2 items-center mt-4">
                <Spinner size="xl" />
                <Description className="text-sm">Please wait, loading package data...</Description>
              </div>
            ) : isValidPython ? (
              <Table>
                <Table.ScrollContainer>
                  <Table.Content
                    disabledKeys={disabledKeys}
                    selectedKeys={selectedKeys}
                    onSelectionChange={setSelectedKeys}
                    selectionMode={anyUpdateAvailable ? 'multiple' : 'none'}>
                    <Table.Header>
                      {anyUpdateAvailable && (
                        <Table.Column className="pr-0">
                          <Checkbox slot="selection">
                            <Checkbox.Control>
                              <Checkbox.Indicator />
                            </Checkbox.Control>
                          </Checkbox>
                        </Table.Column>
                      )}
                      <Table.Column isRowHeader>Name</Table.Column>
                      {anyUpdateAvailable && <Table.Column>Update</Table.Column>}
                      <Table.Column>Action</Table.Column>
                    </Table.Header>
                    <Table.Body items={refreshedItems}>
                      {item => (
                        <Table.Row id={item.name} key={item.name}>
                          {anyUpdateAvailable ? (
                            <Table.Cell className="pr-0">
                              <Checkbox slot="selection" variant="secondary">
                                <Checkbox.Control>
                                  <Checkbox.Indicator />
                                </Checkbox.Control>
                              </Checkbox>
                            </Table.Cell>
                          ) : null}
                          <TableItem
                            item={item}
                            removed={removed}
                            updated={updated}
                            columnKey={'name'}
                            pythonPath={pythonPath}
                            setIsUpdateTerminalOpen={setIsUpdateTerminalOpen}
                            isSelected={selectedKeys === 'all' || selectedKeys.has(item.name)}
                          />
                          {anyUpdateAvailable ? (
                            <TableItem
                              item={item}
                              removed={removed}
                              updated={updated}
                              columnKey={'update'}
                              pythonPath={pythonPath}
                              setIsUpdateTerminalOpen={setIsUpdateTerminalOpen}
                              isSelected={selectedKeys === 'all' || selectedKeys.has(item.name)}
                            />
                          ) : null}
                          <TableItem
                            item={item}
                            removed={removed}
                            updated={updated}
                            columnKey={'actions'}
                            pythonPath={pythonPath}
                            setIsUpdateTerminalOpen={setIsUpdateTerminalOpen}
                            isSelected={selectedKeys === 'all' || selectedKeys.has(item.name)}
                          />
                        </Table.Row>
                      )}
                    </Table.Body>
                  </Table.Content>
                </Table.ScrollContainer>
              </Table>
            ) : (
              <EmptyStateCard
                title="Could not find a virtual environment."
                description="Please select your desire environment."
                action={<SelectEnv id={id} setPythonPath={setPythonPath} />}
              />
            )}
          </div>
        </div>
      </OverlayScrollbarsComponent>
    </ModalBody>
  );
}
