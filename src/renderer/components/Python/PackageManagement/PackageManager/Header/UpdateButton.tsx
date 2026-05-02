import {Button, ButtonGroup, Description, Dropdown, Label, Selection} from '@heroui-v3/react';
import {AltArrowDown} from '@solar-icons/react-perf/Bold';
import {Download, Magnifier} from '@solar-icons/react-perf/BoldDuotone';
import {isEmpty} from 'lodash-es';
import {Dispatch, SetStateAction, useEffect, useMemo, useState} from 'react';

import {FilterKeys, PackageInfo, SitePackages_Info} from '../../../../../../cross/CrossExtTypes';
import pIpc from '../../../../../PIpc';

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
  setProgressValue: Dispatch<SetStateAction<number>>;
};

export default function UpdateButton({
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
  setProgressValue,
}: Props) {
  const [selectedOption, setSelectedOption] = useState<Selection>(new Set([isReqAvailable ? 'req' : 'all']));
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

  useEffect(() => {
    if (!checkingUpdates) {
      setProgressValue(0);
    } else {
      let percentage = 0;

      switch (selectedOptionValue) {
        case 'req':
          percentage = checkedCount.length / reqPackageCount;
          break;
        case 'all':
          percentage = checkedCount.length / allPackageCount;
          break;
      }

      setProgressValue(percentage * 100);
    }
  }, [selectedOptionValue, checkedCount, allPackageCount, reqPackageCount, checkingUpdates]);

  const selectedCount = useMemo(() => {
    return selectedKeys === 'all'
      ? selectedFilter === 'all'
        ? packagesUpdate.length
        : visibleItems.length
      : selectedKeys.size;
  }, [selectedKeys, selectedFilter, packagesUpdate, visibleItems]);

  return !isEmpty(packagesUpdate) ? (
    <Button
      size="sm"
      onPress={update}
      variant="secondary"
      isPending={isUpdating}
      isDisabled={selectedKeys !== 'all' && selectedKeys.size === 0}>
      {!isUpdating && <Download />}
      {isUpdating ? <span>Updating ({selectedCount})...</span> : <span>Update {selectedCount}</span>}
    </Button>
  ) : (
    <ButtonGroup>
      <Button size="sm" variant="secondary" onPress={checkForUpdate} isPending={checkingUpdates}>
        {!checkingUpdates && <Magnifier />}
        {labelsMap[selectedOptionValue]}
      </Button>
      <Dropdown>
        <Button size="sm" variant="tertiary" isDisabled={!isReqAvailable || checkingUpdates} isIconOnly>
          <AltArrowDown />
        </Button>
        <Dropdown.Popover>
          <Dropdown.Menu selectionMode="single" selectedKeys={selectedOption} onSelectionChange={setSelectedOption}>
            <Dropdown.Item id="all" textValue={labelsMap['all']}>
              <div className="flex flex-col">
                <Label>{labelsMap['all']}</Label>
                <Description>{descriptionsMap['all']}</Description>
              </div>
              <Dropdown.ItemIndicator />
            </Dropdown.Item>
            <Dropdown.Item id="req" textValue={labelsMap['req']}>
              <div className="flex flex-col">
                <Label>{labelsMap['req']}</Label>
                <Description>{descriptionsMap['req']}</Description>
              </div>
              <Dropdown.ItemIndicator />
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </ButtonGroup>
  );
}
