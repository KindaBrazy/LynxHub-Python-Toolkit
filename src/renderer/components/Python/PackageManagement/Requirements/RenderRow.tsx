import {CloseButton, Input, ListBox, Select, Table} from '@heroui/react';
import {memo, useCallback, useEffect, useRef, useState} from 'react';

import {RequirementData} from '../../../../../cross/CrossExtTypes';

type Props = {
  item: RequirementData;
  index: number;
  onDelete: (name: string) => void;
  onUpdate: (index: number, updatedRequirement: RequirementData) => void;
};

const OPERATORS = [
  {id: 'all', label: 'Any'},
  {id: '==', label: '=='},
  {id: '>=', label: '>='},
  {id: '<=', label: '<='},
  {id: '>', label: '>'},
  {id: '<', label: '<'},
  {id: '!=', label: '!='},
  {id: '~=', label: '~='},
];

const RenderRow = memo(({item, index, onDelete, onUpdate}: Props) => {
  // Local state for immediate input responsiveness
  const [localName, setLocalName] = useState(item.name || '');
  const [localVersion, setLocalVersion] = useState(item.version || '');
  const [localOperator, setLocalOperator] = useState(item.versionOperator || 'all');

  // Track if this is the initial mount or if we're focused
  const isFocusedRef = useRef(false);
  const prevItemRef = useRef(item);

  // Sync local state when item changes from outside (e.g., search filter change)
  // Only sync if not focused and item actually changed
  useEffect(() => {
    if (isFocusedRef.current) return;

    // Only update if the item reference actually changed (different object)
    if (prevItemRef.current !== item) {
      prevItemRef.current = item;
      setLocalName(item.name || '');
      setLocalVersion(item.version || '');
      setLocalOperator(item.versionOperator || 'all');
    }
  }, [item]);

  // Debounced update to parent - only sync on blur
  const handleNameBlur = useCallback(() => {
    isFocusedRef.current = false;
    if (localName !== item.name) {
      onUpdate(index, {...item, name: localName});
    }
  }, [index, item, localName, onUpdate]);

  const handleVersionBlur = useCallback(() => {
    isFocusedRef.current = false;
    if (localVersion !== item.version) {
      onUpdate(index, {...item, version: localVersion});
    }
  }, [index, item, localVersion, onUpdate]);

  const handleOperatorChange = useCallback(
    (key: string | number | null) => {
      if (!key || typeof key === 'number') return;
      const newOperator = key.toString();
      setLocalOperator(newOperator);
      onUpdate(index, {...item, versionOperator: newOperator === 'all' ? null : newOperator});
    },
    [index, item, onUpdate],
  );

  const handleDelete = useCallback(() => {
    onDelete(localName);
  }, [localName, onDelete]);

  const handleFocus = useCallback(() => {
    isFocusedRef.current = true;
  }, []);

  return (
    <Table.Row id={item.originalLine || `req_${index}`}>
      <Table.Cell>
        <Input
          value={localName}
          spellCheck={false}
          placeholder="name"
          variant="secondary"
          onFocus={handleFocus}
          onBlur={handleNameBlur}
          autoFocus={item.autoFocus}
          onChange={e => setLocalName(e.target.value)}
          fullWidth
        />
      </Table.Cell>
      <Table.Cell>
        <Select
          variant="secondary"
          selectionMode="single"
          placeholder="operator"
          selectedKey={localOperator}
          onChange={handleOperatorChange}>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox items={OPERATORS}>
              {op => (
                <ListBox.Item id={op.id} textValue={op.label}>
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
          spellCheck={false}
          variant="secondary"
          value={localVersion}
          placeholder="version"
          onFocus={handleFocus}
          onBlur={handleVersionBlur}
          onChange={e => setLocalVersion(e.target.value)}
          fullWidth
        />
      </Table.Cell>
      <Table.Cell>
        <CloseButton onPress={handleDelete} />
      </Table.Cell>
    </Table.Row>
  );
});

RenderRow.displayName = 'RenderRow';

export default RenderRow;
