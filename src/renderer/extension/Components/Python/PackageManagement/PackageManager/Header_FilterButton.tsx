import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger} from '@heroui/react';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';

import {FilterKeys} from '../../../../../../cross/extension/CrossExtTypes';
import {Filter_Icon} from '../../../../../src/assets/icons/SvgIcons/SvgIcons1';

type Props = {
  setSelectedFilter: Dispatch<SetStateAction<FilterKeys>>;
  updateAvailable: boolean;
};

export default function Header_FilterButton({setSelectedFilter, updateAvailable}: Props) {
  const [selectedKeys, setSelectedKeys] = useState<Set<FilterKeys>>(new Set(['all']));

  useEffect(() => {
    setSelectedFilter(Array.from(selectedKeys).join(', ').replace(/_/g, '') as FilterKeys);
  }, [selectedKeys]);

  useEffect(() => {
    if (updateAvailable) setSelectedKeys(new Set(['updates']));
  }, [updateAvailable]);

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
        aria-label="Filter packages"
        // @ts-ignore-next-line
        onSelectionChange={setSelectedKeys}
        disabledKeys={!updateAvailable ? ['updates'] : undefined}
        disallowEmptySelection>
        <DropdownSection showDivider={updateAvailable}>
          <DropdownItem key="all">All</DropdownItem>
          <DropdownItem key="updates">Updates</DropdownItem>
        </DropdownSection>
        {updateAvailable ? (
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
        ) : (
          <DropdownItem key="nothing" className="hidden" />
        )}
      </DropdownMenu>
    </Dropdown>
  );
}
