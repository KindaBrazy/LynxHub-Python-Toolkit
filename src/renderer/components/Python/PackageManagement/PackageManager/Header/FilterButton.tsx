import {Button, cn, Dropdown, Label, Selection} from '@heroui-v3/react';
import {Filter} from '@solar-icons/react-perf/BoldDuotone';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';

import {FilterKeys} from '../../../../../../cross/CrossExtTypes';

type Props = {
  setSelectedFilter: Dispatch<SetStateAction<FilterKeys>>;
  updateAvailable: boolean;
  className?: string;
};

export default function FilterButton({setSelectedFilter, updateAvailable, className}: Props) {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set(['all']));

  useEffect(() => {
    setSelectedFilter(Array.from(selectedKeys).join(', ').replace(/_/g, '') as FilterKeys);
  }, [selectedKeys]);

  useEffect(() => {
    if (updateAvailable) {
      setSelectedKeys(new Set(['updates']));
    } else {
      setSelectedKeys(prevState => {
        if (prevState !== 'all' && prevState.values().next().value === 'updates') {
          return new Set(['all']);
        }
        return prevState;
      });
    }
  }, [updateAvailable]);

  return (
    <Dropdown>
      <Button variant="tertiary" className={cn('shrink-0', className)} isIconOnly>
        <Filter />
      </Button>
      <Dropdown.Popover>
        <Dropdown.Menu
          selectionMode="single"
          onSelectionChange={setSelectedKeys}
          selectedKeys={Array.from(selectedKeys)}
          disabledKeys={!updateAvailable ? ['updates'] : undefined}
          disallowEmptySelection>
          <Dropdown.Item id="all" textValue="All">
            <Dropdown.ItemIndicator />
            <Label>All</Label>
          </Dropdown.Item>
          <Dropdown.Item id="updates" textValue="Updates">
            <Dropdown.ItemIndicator />
            <Label>Updates</Label>
          </Dropdown.Item>
          {updateAvailable && (
            <>
              <Dropdown.Item id="prerelease" textValue="Pre Release">
                <Dropdown.ItemIndicator />
                <Label>Pre Release</Label>
              </Dropdown.Item>
              <Dropdown.Item id="major" textValue="Major">
                <Dropdown.ItemIndicator />
                <Label>Major</Label>
              </Dropdown.Item>
              <Dropdown.Item id="minor" textValue="Minor">
                <Dropdown.ItemIndicator />
                <Label>Minor</Label>
              </Dropdown.Item>
              <Dropdown.Item id="patch" textValue="Patch">
                <Dropdown.ItemIndicator />
                <Label>Patch</Label>
              </Dropdown.Item>
              <Dropdown.Item id="others" textValue="Others">
                <Dropdown.ItemIndicator />
                <Label>Others</Label>
              </Dropdown.Item>
            </>
          )}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
