import {CloseButton, EmptyState, Input, ListBox, Select, Table} from '@heroui/react';
import LynxScroll from '@lynx/components/LynxScroll';
import {ListCross} from '@solar-icons/react-perf/BoldDuotone';
import {OverlayScrollbarsComponentRef} from 'overlayscrollbars-react';
import {Dispatch, ReactNode, RefObject, SetStateAction, useMemo} from 'react';

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
  const handleRequirementChange = (index: number, updatedRequirement: RequirementData) => {
    setRequirements(prevState => prevState.map((req, i) => (i === index ? updatedRequirement : req)));
  };

  const handleDeleteRequirement = (name: string) => {
    setRequirements(prevState => prevState.filter(item => item.name !== name));
  };

  const tableReq: TableReq[] = useMemo(
    () =>
      requirements.map((req, index) => {
        return {
          key: req.name || `req_${index}`,
          name: (
            <Input
              spellCheck="false"
              placeholder="name"
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
              placeholder="version"
              defaultValue={req.version || ''}
              onChange={e => handleRequirementChange(index, {...req, version: e.target.value})}
              fullWidth
            />
          ),
          operator: (
            <Select
              onChange={key => {
                if (!key || typeof key === 'number') return;
                handleRequirementChange(index, {...req, versionOperator: key.toString()});
              }}
              variant="secondary"
              selectionMode="single"
              placeholder="operator"
              value={req.versionOperator || 'all'}>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox items={operators}>
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
    [requirements],
  );

  return (
    <LynxScroll ref={scrollRef} className="pr-4">
      <Table>
        <Table.ScrollContainer>
          <Table.Content>
            <Table.Header>
              <Table.Column isRowHeader>Name</Table.Column>
              <Table.Column>Operator</Table.Column>
              <Table.Column>Version</Table.Column>
              <Table.Column>Actions</Table.Column>
            </Table.Header>
            <Table.Body
              renderEmptyState={() => (
                <EmptyState
                  className={'flex h-full w-full flex-col items-center justify-center gap-y-2 text-center my-4'}>
                  <ListCross className="size-12" />
                  <span className="text-sm text-muted">No results found</span>
                </EmptyState>
              )}
              items={tableReq}>
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
    </LynxScroll>
  );
}
