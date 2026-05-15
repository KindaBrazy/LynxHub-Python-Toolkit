import {EmptyState, Table} from '@heroui/react';
import LynxScroll from '@lynx/components/LynxScroll';
import {ListCross} from '@solar-icons/react-perf/BoldDuotone';
import {OverlayScrollbarsComponentRef} from 'overlayscrollbars-react';
import {Dispatch, memo, RefObject, SetStateAction} from 'react';

import {RequirementData} from '../../../../../cross/CrossExtTypes';
import RenderRow from './RenderRow';

type Props = {
  filteredReqs: RequirementData[];
  setRequirements: Dispatch<SetStateAction<RequirementData[]>>;
  scrollRef: RefObject<OverlayScrollbarsComponentRef | null>;
};

const RenderTable = memo(({filteredReqs, setRequirements, scrollRef}: Props) => {
  const handleRequirementChange = (index: number, updatedRequirement: RequirementData) => {
    setRequirements(prevState => prevState.map((req, i) => (i === index ? updatedRequirement : req)));
  };

  const handleDeleteRequirement = (name: string) => {
    setRequirements(prevState => prevState.filter(item => item.name !== name));
  };

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
              )}>
              {filteredReqs.map((item, index) => (
                <RenderRow
                  item={item}
                  index={index}
                  key={`req_${index}`}
                  handleRequirementChange={handleRequirementChange}
                  handleDeleteRequirement={handleDeleteRequirement}
                />
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </LynxScroll>
  );
});

export default RenderTable;
