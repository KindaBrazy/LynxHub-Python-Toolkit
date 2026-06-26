import {Checkbox, Description, ModalBody, ScrollShadow, Selection, Spinner, Table} from '@heroui/react';
import EmptyStateCard from '@lynx/components/EmptyStateCard';
import {ObjectScan} from '@solar-icons/react-perf/BoldDuotone';
import {cloneDeep, isEmpty} from 'lodash-es';
import {Dispatch, SetStateAction, useMemo} from 'react';

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
  setIsUpdateTerminalOpen: (value: boolean) => void;
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
  const anyUpdateAvailable = useMemo(() => packagesUpdate.length !== 0, [packagesUpdate]);

  const disabledKeys = useMemo(() => {
    if (isEmpty(packagesUpdate)) return [];
    return items.filter(item => !packagesUpdate.some(update => update.name === item.name)).map(item => item.name);
  }, [items, packagesUpdate]);

  const refreshedItems = useMemo(() => cloneDeep(items), [items, selectedKeys, anyUpdateAvailable]);

  return (
    <ModalBody className="overflow-hidden">
      <ScrollShadow className="size-full px-6 pt-2 pb-6">
        <div className="w-full flex flex-col gap-y-4 size-full">
          <div className="flex flex-row gap-8 flex-wrap justify-center size-full">
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
                variant="secondary"
                className="size-full"
                bodyClassName="gap-y-1"
                title="No virtual environment detected"
                description="Select the environment you'd like to use."
                action={<SelectEnv id={id} setPythonPath={setPythonPath} />}
                icon={<ObjectScan className="size-24 mb-4 text-warning-hover" />}
              />
            )}
          </div>
        </div>
      </ScrollShadow>
    </ModalBody>
  );
}
