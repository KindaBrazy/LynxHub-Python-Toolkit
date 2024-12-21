import {
  Button,
  getKeyValue,
  Input,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';
import {OverlayScrollbarsComponent, OverlayScrollbarsComponentRef} from 'overlayscrollbars-react';
import {Dispatch, ReactNode, RefObject, SetStateAction, useEffect, useState} from 'react';

import {RequirementData} from '../../../../../../cross/extension/CrossExtTypes';
import {useAppState} from '../../../../../src/App/Redux/App/AppReducer';

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
  scrollRef: RefObject<OverlayScrollbarsComponentRef>;
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
              size="sm"
              spellCheck={false}
              autoFocus={req.autoFocus}
              defaultValue={req.name || ''}
              onValueChange={name => handleRequirementChange(index, {...req, name})}
            />
          ),
          version: (
            <Input
              size="sm"
              spellCheck={false}
              defaultValue={req.version || ''}
              onValueChange={version => handleRequirementChange(index, {...req, version})}
            />
          ),
          operator: (
            <Select
              // @ts-ignore-next-line
              onSelectionChange={(selected: Set<string>) =>
                handleRequirementChange(index, {
                  ...req,
                  versionOperator: selected.values().next().value || 'all',
                })
              }
              size="sm"
              aria-label="Operator selection"
              classNames={{mainWrapper: '!min-w-20'}}
              defaultSelectedKeys={[req.versionOperator || 'all']}>
              {operators.map(op => (
                <SelectItem key={op.key} aria-label={op.label}>
                  {op.label}
                </SelectItem>
              ))}
            </Select>
          ),
          actions: (
            <Button size="sm" color="danger" variant="flat" onPress={() => handleDeleteRequirement(req.name)}>
              Remove
            </Button>
          ),
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
      <Table aria-label="requirements data" classNames={{wrapper: 'bg-foreground-200 dark:bg-black/50'}}>
        <TableHeader
          columns={[
            {key: 'name', label: 'Name'},
            {key: 'operator', label: 'Operator'},
            {key: 'version', label: 'Version'},
            {key: 'actions', label: 'Actions'},
          ]}>
          {column => <TableColumn key={column.key}>{column.label}</TableColumn>}
        </TableHeader>
        <TableBody items={tableReq}>
          {item => (
            <TableRow key={item.key}>{columnKey => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}</TableRow>
          )}
        </TableBody>
      </Table>
    </OverlayScrollbarsComponent>
  );
}
