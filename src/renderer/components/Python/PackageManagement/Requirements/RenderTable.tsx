import {EmptyState, Table} from '@heroui/react';
import LynxScroll from '@lynx/components/LynxScroll';
import {ListCross} from '@solar-icons/react-perf/BoldDuotone';
import {OverlayScrollbarsComponentRef} from 'overlayscrollbars-react';
import {Dispatch, memo, RefObject, SetStateAction, useCallback} from 'react';

import {RequirementData} from '../../../../../cross/CrossExtTypes';
import RenderRow from './RenderRow';

type Props = {
  filteredReqs: RequirementData[];
  setRequirements: Dispatch<SetStateAction<RequirementData[]>>;
  scrollRef: RefObject<OverlayScrollbarsComponentRef | null>;
};

const RenderTable = memo(({filteredReqs, setRequirements, scrollRef}: Props) => {
  // Stable callback references to prevent unnecessary re-renders
  const handleUpdate = useCallback(
    (index: number, updated: RequirementData) => {
      setRequirements(prev => {
        const newState = [...prev];
        // Find the actual index in the full requirements array
        const item = filteredReqs[index];
        const actualIndex = prev.findIndex(req => req.name === item.name || req.originalLine === item.originalLine);
        if (actualIndex !== -1) {
          newState[actualIndex] = updated;
        }
        return newState;
      });
    },
    [filteredReqs, setRequirements],
  );

  const handleDelete = useCallback(
    (name: string) => {
      setRequirements(prev => prev.filter(item => item.name !== name));
    },
    [setRequirements],
  );

  return (
    <LynxScroll ref={scrollRef} className="pr-4">
      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label="Requirements table">
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
              )}>
              {filteredReqs.map((item, index) => (
                <RenderRow
                  item={item}
                  index={index}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  key={item.originalLine || `new_req_${index}`}
                />
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </LynxScroll>
  );
});

RenderTable.displayName = 'RenderTable';

export default RenderTable;
