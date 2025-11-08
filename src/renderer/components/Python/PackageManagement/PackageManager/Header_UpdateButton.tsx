import {
  Button,
  ButtonGroup,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Progress,
  Selection,
} from '@heroui/react';
import {isEmpty} from 'lodash';
import {useEffect, useMemo, useState} from 'react';

import {Download2_Icon, Magnifier_Icon} from '../../../../../../../src/renderer/src/assets/icons/SvgIcons/SvgIcons';
import {FilterKeys, PackageInfo, SitePackages_Info} from '../../../../../cross/CrossExtTypes';
import pIpc from '../../../../PIpc';
import {AltArrow_Icon} from '../../../SvgIcons';

type Props = {
  packagesUpdate: SitePackages_Info[];
  update: () => void;
  isUpdating: boolean;
  checkForUpdates: (type: 'req' | 'normal') => void;
  checkingUpdates: boolean;
  isReqAvailable: boolean;
  selectedKeys: Selection;
  visibleItems: PackageInfo[];
  selectedFilter: FilterKeys;

  allPackageCount: number;
  reqPackageCount: number;
};

export default function Header_UpdateButton({
  packagesUpdate,
  update,
  isUpdating,
  checkForUpdates,
  checkingUpdates,
  isReqAvailable,
  selectedKeys,
  visibleItems,
  selectedFilter,
  allPackageCount,
  reqPackageCount,
}: Props) {
  const [selectedOption, setSelectedOption] = useState(new Set([isReqAvailable ? 'req' : 'all']));
  const [checkedCount, setCheckedCount] = useState<string[]>([]);

  useEffect(() => {
    const offProgress = pIpc.onUpdateCheckProgress((_, packageName) => {
      setCheckedCount(prevState => (prevState.includes(packageName) ? prevState : [...prevState, packageName]));
    });

    return () => offProgress();
  }, []);

  useEffect(() => {
    setSelectedOption(new Set([isReqAvailable ? 'req' : 'all']));
  }, [isReqAvailable]);

  const descriptionsMap = useMemo(() => {
    return {
      all: 'Check all installed packages for updates.',
      req: `Check for updates based on your project's requirements file.`,
    };
  }, []);

  const labelsMap = useMemo(() => {
    return {
      all: checkingUpdates ? `Checking All (${checkedCount.length}/${allPackageCount})...` : `Check for Updates (All)`,
      req: checkingUpdates
        ? `Checking Requirements (${checkedCount.length}/${reqPackageCount})...`
        : `Check for Updates (Requirements)`,
    };
  }, [checkingUpdates, allPackageCount, reqPackageCount, checkedCount]);

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

  const progressPercentage = useMemo(() => {
    let percentage = 0;

    switch (selectedOptionValue) {
      case 'req':
        percentage = checkedCount.length / reqPackageCount;
        break;
      case 'all':
        percentage = checkedCount.length / allPackageCount;
        break;
    }

    return percentage * 100;
  }, [selectedOptionValue, checkedCount, allPackageCount, reqPackageCount]);

  return !isEmpty(packagesUpdate) ? (
    <Button
      size="sm"
      radius="sm"
      variant="flat"
      color="success"
      onPress={update}
      className="!min-w-40"
      isLoading={isUpdating}
      startContent={!isUpdating && <Download2_Icon />}
      isDisabled={selectedKeys !== 'all' && selectedKeys.size === 0}>
      {isUpdating ? (
        <span>Updating...</span>
      ) : (
        <span>
          Update{' '}
          {selectedKeys === 'all' ? (
            <span>All ({selectedFilter === 'all' ? packagesUpdate.length : visibleItems.length})</span>
          ) : (
            <span>Selected ({selectedKeys.size})</span>
          )}
        </span>
      )}
    </Button>
  ) : (
    <div className="flex flex-col">
      <ButtonGroup size="sm" variant="solid">
        <Button
          onPress={checkForUpdate}
          isLoading={checkingUpdates}
          startContent={!checkingUpdates && <Magnifier_Icon />}>
          {labelsMap[selectedOptionValue]}
          {checkingUpdates && (
            <Progress
              size="sm"
              radius="none"
              color="success"
              value={progressPercentage}
              className="absolute -bottom-[2px]"
              aria-label="Update check progress"
              classNames={{indicator: 'max-h-[2px]'}}
            />
          )}
        </Button>
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Button variant="faded" isDisabled={!isReqAvailable || checkingUpdates} isIconOnly>
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
    </div>
  );
}
