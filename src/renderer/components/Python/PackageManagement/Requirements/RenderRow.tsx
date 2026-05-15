import {CloseButton, Input, ListBox, Select, Table} from '@heroui/react';
import {memo, useState} from 'react';

import {RequirementData} from '../../../../../cross/CrossExtTypes';

type Props = {
  item: RequirementData;
  index: number;
  handleDeleteRequirement: (name: string) => void;
  handleRequirementChange: (index: number, updatedRequirement: RequirementData) => void;
};

const RenderRow = memo(({item, index, handleDeleteRequirement, handleRequirementChange}: Props) => {
  const [operators] = useState([
    {key: 'all', label: 'Any'},
    {key: '==', label: '=='},
    {key: '>=', label: '>='},
    {key: '<=', label: '<='},
    {key: '>', label: '>'},
    {key: '<', label: '<'},
    {key: '!=', label: '!='},
    {key: '~=', label: '~='},
  ]);

  return (
    <Table.Row id={`req_${index}`}>
      <Table.Cell>
        <Input
          spellCheck="false"
          placeholder="name"
          variant="secondary"
          autoFocus={item.autoFocus}
          defaultValue={item.name || ''}
          onChange={e => handleRequirementChange(index, {...item, name: e.target.value})}
          fullWidth
        />
      </Table.Cell>
      <Table.Cell>
        <Select
          onChange={key => {
            if (!key || typeof key === 'number') return;
            handleRequirementChange(index, {...item, versionOperator: key.toString()});
          }}
          variant="secondary"
          selectionMode="single"
          placeholder="operator"
          value={item.versionOperator || 'all'}>
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
      </Table.Cell>
      <Table.Cell>
        <Input
          spellCheck="false"
          variant="secondary"
          placeholder="version"
          defaultValue={item.version || ''}
          onChange={e => handleRequirementChange(index, {...item, version: e.target.value})}
          fullWidth
        />
      </Table.Cell>
      <Table.Cell>
        <CloseButton onPress={() => handleDeleteRequirement(item.name)} />
      </Table.Cell>
    </Table.Row>
  );
});

export default RenderRow;
