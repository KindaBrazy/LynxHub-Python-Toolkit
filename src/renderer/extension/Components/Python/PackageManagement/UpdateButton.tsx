import {Button, ButtonGroup, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from '@nextui-org/react';
import {isEmpty} from 'lodash';
import {useEffect, useMemo, useState} from 'react';

import {SitePackages_Info} from '../../../../../cross/extension/CrossExtTypes';
import {Download2_Icon} from '../../../../src/assets/icons/SvgIcons/SvgIcons1';
import {Magnifier_Icon} from '../../../../src/assets/icons/SvgIcons/SvgIcons4';
import {AltArrow_Icon} from '../../SvgIcons';

type Props = {
  packagesUpdate: SitePackages_Info[];
  updateAll: () => void;
  isUpdating: boolean;
  checkForUpdates: (type: 'req' | 'normal') => void;
  checkingUpdates: boolean;
  isReqAvailable: boolean;
};

export default function UpdateButton({
  packagesUpdate,
  updateAll,
  isUpdating,
  checkForUpdates,
  checkingUpdates,
  isReqAvailable,
}: Props) {
  const [selectedOption, setSelectedOption] = useState(new Set([isReqAvailable ? 'req' : 'all']));

  useEffect(() => {
    setSelectedOption(new Set([isReqAvailable ? 'req' : 'all']));
  }, [isReqAvailable]);

  const descriptionsMap = useMemo(() => {
    return {
      all: 'Check for all packages updates.',
      req: 'Check for packages updates based on Requirements.',
    };
  }, []);

  const labelsMap = useMemo(() => {
    return {
      all: checkingUpdates ? 'Checking (All)...' : `Check for Updates (All)`,
      req: checkingUpdates ? 'Checking (Requirements)...' : `Check for Updates (Requirements)`,
    };
  }, [isUpdating, packagesUpdate]);

  const selectedOptionValue = useMemo(() => {
    return Array.from(selectedOption)[0];
  }, [selectedOption]);

  const checkForUpdate = () => {
    if (selectedOptionValue === 'all') {
      checkForUpdates('normal');
    } else {
      checkForUpdates('req');
    }
  };

  return !isEmpty(packagesUpdate) ? (
    <Button
      size="sm"
      radius="sm"
      variant="flat"
      color="success"
      onPress={updateAll}
      className="!min-w-40"
      isLoading={isUpdating}
      startContent={!isUpdating && <Download2_Icon />}>
      {isUpdating ? <span>Updating...</span> : <span>Update All ({packagesUpdate.length})</span>}
    </Button>
  ) : (
    <ButtonGroup size="sm" variant="solid">
      <Button
        onPress={checkForUpdate}
        isLoading={checkingUpdates}
        startContent={!checkingUpdates && <Magnifier_Icon />}>
        {labelsMap[selectedOptionValue]}
      </Button>
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Button isDisabled={!isReqAvailable || checkingUpdates} isIconOnly>
            <AltArrow_Icon className="size-4" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          selectionMode="single"
          aria-label="Merge options"
          selectedKeys={selectedOption}
          // @ts-ignore-next-line
          onSelectionChange={setSelectedOption}
          disallowEmptySelection>
          <DropdownItem key="all" description={descriptionsMap['all']}>
            {labelsMap['all']}
          </DropdownItem>
          <DropdownItem key="req" description={descriptionsMap['req']}>
            {labelsMap['req']}
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </ButtonGroup>
  );
}
