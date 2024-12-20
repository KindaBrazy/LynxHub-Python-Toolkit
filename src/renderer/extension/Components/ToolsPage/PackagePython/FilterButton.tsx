import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger} from '@nextui-org/react';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';

import {FilterKeys} from '../../../../../cross/Extension/CrossExtTypes';
import {Filter_Icon} from '../../../../src/assets/icons/SvgIcons/SvgIcons1';

type Props = {setSelectedFilter: Dispatch<SetStateAction<FilterKeys>>};

export default function FilterButton({setSelectedFilter}: Props) {
  const [selectedKeys, setSelectedKeys] = useState<Set<FilterKeys>>(new Set(['all']));

  useEffect(() => {
    setSelectedFilter(Array.from(selectedKeys).join(', ').replace(/_/g, ''));
  }, [selectedKeys]);

  return (
    <Dropdown size="sm" className="border-1 border-foreground-100">
      <DropdownTrigger>
        <Button size="sm" variant="faded" isIconOnly>
          <Filter_Icon />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        variant="faded"
        selectionMode="single"
        selectedKeys={selectedKeys}
        // @ts-ignore-next-line
        onSelectionChange={setSelectedKeys}
        aria-label="Single selection example"
        disallowEmptySelection>
        <DropdownSection showDivider>
          <DropdownItem key="all">All</DropdownItem>
          <DropdownItem key="updates">Updates</DropdownItem>
        </DropdownSection>
        <DropdownSection>
          <DropdownItem key="prerelease" className="text-blue-500">
            Pre Release
          </DropdownItem>
          <DropdownItem key="major" className="text-red-500">
            Major
          </DropdownItem>
          <DropdownItem key="minor" className="text-yellow-500">
            Minor
          </DropdownItem>
          <DropdownItem key="patch" className="text-green-500">
            Patch
          </DropdownItem>
          <DropdownItem key="others" className="text-gray-500">
            Others
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
}
