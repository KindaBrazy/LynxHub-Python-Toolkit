import {
  Button,
  ButtonGroup,
  Divider,
  Input,
  ModalHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Selection,
} from '@nextui-org/react';
import {message} from 'antd';
import {isEmpty} from 'lodash';
import {Dispatch, ReactNode, SetStateAction, useState} from 'react';

import {FilterKeys, PackageInfo, SitePackages_Info} from '../../../../../../cross/extension/CrossExtTypes';
import {Add_Icon, Circle_Icon} from '../../../../../src/assets/icons/SvgIcons/SvgIcons1';
import pIpc from '../../../../PIpc';
import RequirementsBtn from '../Requirements/RequirementsModalButton';
import Header_FilterButton from './Header_FilterButton';
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
}: Props) {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [installing, setInstalling] = useState<boolean>(false);

  const [installPackageName, setInstallPackageName] = useState<string>('');
  const [installPopover, setInstallPopover] = useState<boolean>(false);

  const [isReqAvailable, setIsReqAvailable] = useState<boolean>(false);

  const update = () => {
    setIsUpdating(true);
    let updateList: string[];
    if (selectedKeys === 'all') {
      updateList =
        selectedFilter === 'all' ? packagesUpdate.map(item => item.name) : visibleItems.map(item => item.name);
    } else {
      updateList = Array.from(selectedKeys) as string[];
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

  const installPackage = () => {
    setInstallPopover(false);
    setInstalling(true);
    pIpc
      .installPackage(pythonPath, installPackageName)
      .then(() => {
        message.success(`Package "${installPackageName}" installed successfully.`);
        setInstallPackageName('');
        refresh();
      })
      .catch(e => {
        console.error(e);
        message.error(`Failed to install package "${installPackageName}".`);
      })
      .finally(() => {
        setInstalling(false);
      });
  };

  const installReq = () => {
    setInstallPopover(false);
    setInstalling(true);
    pIpc
      .installPackageReq(pythonPath)
      .then(() => {
        message.success(`Packages from requirements file installed successfully.`);
        refresh();
      })
      .catch(e => {
        console.error(e);
        message.error(`Failed to install packages from requirements file.`);
      })
      .finally(() => {
        setInstalling(false);
      });
  };

  return (
    <ModalHeader className="bg-foreground-200 dark:bg-LynxRaisinBlack items-center flex-col gap-y-2">
      <div className="flex flex-row justify-between w-full">
        {isValidPython ? (
          <span>
            {title} ({packages.length})
          </span>
        ) : (
          <span>{title}</span>
        )}
        <Header_FilterButton setSelectedFilter={setSelectedFilter} updateAvailable={!isEmpty(packagesUpdate)} />
      </div>
      {!isEmpty(packages) && (
        <Input
          size="sm"
          radius="sm"
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
            checkForUpdates={checkForUpdates}
            checkingUpdates={checkingUpdates}
          />
        )}
        <ButtonGroup size="sm" fullWidth>
          {isValidPython && (
            <>
              <Popover radius="sm" placement="bottom" isOpen={installPopover} onOpenChange={setInstallPopover}>
                <PopoverTrigger>
                  <Button radius="sm" variant="solid" isLoading={installing} startContent={!installing && <Add_Icon />}>
                    {installing ? <span>Installing {installPackageName}...</span> : <span>Install Package</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="py-4 gap-y-2">
                  <span className="font-bold text-[11pt]">Install Python Package</span>
                  <Divider />
                  <Input
                    className="min-w-64"
                    value={installPackageName}
                    label="Enter Package Name:"
                    onValueChange={setInstallPackageName}
                    placeholder="e.g., requests or e.g., pandas"
                  />
                  <div className="w-full">
                    <Button size="sm" onPress={installPackage} fullWidth>
                      Install
                    </Button>
                  </div>
                  <Divider />
                  <div className="w-full">
                    <Button className="w-full" onPress={installReq}>
                      Install from Requirements
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <RequirementsBtn id={id} projectPath={projectPath} setIsReqAvailable={setIsReqAvailable} />
            </>
          )}
        </ButtonGroup>

        {isValidPython && actionButtons?.map(ActionButton => ActionButton)}
      </div>
    </ModalHeader>
  );
}
