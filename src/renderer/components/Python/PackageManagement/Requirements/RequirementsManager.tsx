import {CloseButton, Input, ListBox, Select, Selection, Table} from '@heroui-v3/react';
import {OverlayScrollbarsComponent, OverlayScrollbarsComponentRef} from 'overlayscrollbars-react';
import {Dispatch, ReactNode, RefObject, SetStateAction, useEffect, useState} from 'react';

import {useAppState} from '../../../../../../../src/renderer/mainWindow/redux/reducers/app';
import {RequirementData} from '../../../../../cross/CrossExtTypes';

type TableReq = {
  key: string;
  name: ReactNode;
  operator: ReactNode;
  version: ReactNode;
  actions: ReactNode;
};

type Props = {
  requirements: RequirementData[];
  setRequirements: Dispatch<SetStateAction<RequirementData[]>>;
  scrollRef: RefObject<OverlayScrollbarsComponentRef | null>;
};

const operators = [
  {key: 'all', label: 'Any'},
  {key: '==', label: '=='},
  {key: '>=', label: '>='},
  {key: '<=', label: '<='},
  {key: '>', label: '>'},
  {key: '<', label: '<'},
  {key: '!=', label: '!='},
  {key: '~=', label: '~='},
];

export default function RequirementsManager({requirements, setRequirements, scrollRef}: Props) {
  const darkMode = useAppState('darkMode');
  const [tableReq, setTableReq] = useState<TableReq[]>([]);

  const handleRequirementChange = (index: number, updatedRequirement: RequirementData) => {
    setRequirements(prevState => prevState.map((req, i) => (i === index ? updatedRequirement : req)));
  };

  const handleDeleteRequirement = (name: string) => {
    setRequirements(prevState => prevState.filter(item => item.name !== name));
  };

  useEffect(() => {
    setTableReq(
      requirements.map((req, index) => {
        return {
          key: req.name,
          name: (
            <Input
              spellCheck="false"
              variant="secondary"
              autoFocus={req.autoFocus}
              defaultValue={req.name || ''}
              onChange={e => handleRequirementChange(index, {...req, name: e.target.value})}
              fullWidth
            />
          ),
          version: (
            <Input
              spellCheck="false"
              variant="secondary"
              defaultValue={req.version || ''}
              onChange={e => handleRequirementChange(index, {...req, version: e.target.value})}
              fullWidth
            />
          ),
          operator: (
            <Select variant="secondary" placeholder="Select one">
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox
                  onSelectionChange={(selected: Selection) => {
                    if (selected === 'all') return;

                    handleRequirementChange(index, {
                      ...req,
                      versionOperator: String(selected.values().next().value) || 'all',
                    });
                  }}
                  items={operators}
                  selectionMode="single"
                  defaultSelectedKeys={[req.versionOperator || 'all']}>
                  {op => (
                    <ListBox.Item id={op.key} textValue={op.label}>
                      {op.label}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  )}
                </ListBox>
              </Select.Popover>
            </Select>
          ),
          actions: <CloseButton onPress={() => handleDeleteRequirement(req.name)} />,
        };
      }),
    );
  }, [requirements]);

  return (
    <OverlayScrollbarsComponent
      options={{
        overflow: {x: 'hidden', y: 'scroll'},
        scrollbars: {
          autoHide: 'move',
          clickScroll: true,
          theme: darkMode ? 'os-theme-light' : 'os-theme-dark',
        },
      }}
      ref={scrollRef}
      className="pr-4">
      <Table>
        <Table.ScrollContainer>
          <Table.Content>
            <Table.Header>
              <Table.Column isRowHeader>Name</Table.Column>
              <Table.Column>Operator</Table.Column>
              <Table.Column>Version</Table.Column>
              <Table.Column>Actions</Table.Column>
            </Table.Header>
            <Table.Body items={tableReq}>
              {item => (
                <Table.Row id={item.key}>
                  <Table.Cell>{item.name}</Table.Cell>
                  <Table.Cell>{item.operator}</Table.Cell>
                  <Table.Cell>{item.version}</Table.Cell>
                  <Table.Cell>{item.actions}</Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </OverlayScrollbarsComponent>
  );
}
