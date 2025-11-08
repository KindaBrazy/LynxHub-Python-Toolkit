import {ButtonGroup, Chip, Input, ModalHeader, Selection} from '@heroui/react';
import {message} from 'antd';
import {compact, isEmpty} from 'lodash';
import {Dispatch, ReactNode, SetStateAction, useState} from 'react';

import {Circle_Icon} from '../../../../../../../src/renderer/src/assets/icons/SvgIcons/SvgIcons';
import {FilterKeys, PackageInfo, PackageUpdate, SitePackages_Info} from '../../../../../cross/CrossExtTypes';
import pIpc from '../../../../PIpc';
import RequirementsBtn from '../Requirements/RequirementsModalButton';
import Header_FilterButton from './Header_FilterButton';
import Header_InstallerModal from './Header_InstallerModal';
import Header_UpdateButton from './Header_UpdateButton';

type Props = {
  title: string;
  actionButtons?: ReactNode[];
  searchValue: string;
  setSearchValue: Dispatch<SetStateAction<string>>;
  packages: PackageInfo[];
  packagesUpdate: SitePackages_Info[];
  checkingUpdates: boolean;
  pythonPath: string;
  allUpdated: () => void;
  refresh: () => void;
  isValidPython: boolean;
  checkForUpdates: (type: 'req' | 'normal') => void;

  id: string;
  projectPath?: string;
  setSelectedFilter: Dispatch<SetStateAction<FilterKeys>>;
  selectedFilter: FilterKeys;
  selectedKeys: Selection;
  visibleItems: PackageInfo[];

  show: string;
};

export default function PackageManagerHeader({
  searchValue,
  setSearchValue,
  packages,
  packagesUpdate,
  checkingUpdates,
  pythonPath,
  allUpdated,
  refresh,
  title,
  actionButtons,
  isValidPython,
  checkForUpdates,
  id,
  projectPath,
  setSelectedFilter,
  selectedFilter,
  selectedKeys,
  visibleItems,
  show,
}: Props) {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const [isReqAvailable, setIsReqAvailable] = useState<boolean>(false);
  const [reqPackageCount, setReqPackageCount] = useState<number>(0);

  const update = () => {
    setIsUpdating(true);
    let updateList: PackageUpdate[];
    if (selectedKeys === 'all') {
      updateList =
        selectedFilter === 'all'
          ? packagesUpdate.map(item => ({name: item.name, targetVersion: item.version}))
          : visibleItems.map(item => ({name: item.name, targetVersion: item.updateVersion}));
    } else {
      updateList = compact(
        packagesUpdate.map(item => {
          const selections = Array.from(selectedKeys) as string[];

          if (selections.includes(item.name)) return {name: item.name, targetVersion: item.version};

          return null;
        }),
      );
    }
    pIpc
      .updateAllPackages(pythonPath, updateList)
      .then(() => {
        message.success(`Successfully updated all selected packages (${updateList.length} total).`);
        allUpdated();
      })
      .catch(() => {
        message.error(`Failed to update packages.`);
      })
      .finally(() => {
        setIsUpdating(false);
      });
  };

  return (
    <ModalHeader className="bg-foreground-200 dark:bg-LynxRaisinBlack items-center flex-col gap-y-2">
      <div className="flex flex-row justify-between w-full">
        {isValidPython ? (
          <>
            <span>
              {title}{' '}
              <Chip size="sm" variant="flat">
                {packages.length}
              </Chip>
            </span>
            <Header_FilterButton setSelectedFilter={setSelectedFilter} updateAvailable={!isEmpty(packagesUpdate)} />
          </>
        ) : (
          <span>{title}</span>
        )}
      </div>
      {!isEmpty(packages) && (
        <Input
          type="search"
          className="pt-1"
          value={searchValue}
          startContent={<Circle_Icon />}
          onValueChange={setSearchValue}
          placeholder="Search for packages..."
        />
      )}
      <div className="gap-x-2 flex items-center w-full mt-2">
        {isValidPython && (
          <Header_UpdateButton
            update={update}
            isUpdating={isUpdating}
            visibleItems={visibleItems}
            selectedKeys={selectedKeys}
            selectedFilter={selectedFilter}
            isReqAvailable={isReqAvailable}
            packagesUpdate={packagesUpdate}
            reqPackageCount={reqPackageCount}
            allPackageCount={packages.length}
            checkForUpdates={checkForUpdates}
            checkingUpdates={checkingUpdates}
          />
        )}
        <ButtonGroup size="sm" fullWidth>
          {isValidPython && (
            <>
              <Header_InstallerModal show={show} refresh={refresh} pythonPath={pythonPath} />

              <RequirementsBtn
                id={id}
                show={show}
                projectPath={projectPath}
                setIsReqAvailable={setIsReqAvailable}
                setReqPackageCount={setReqPackageCount}
              />
            </>
          )}
        </ButtonGroup>

        {isValidPython && actionButtons?.map(ActionButton => ActionButton)}
      </div>
    </ModalHeader>
  );
}
