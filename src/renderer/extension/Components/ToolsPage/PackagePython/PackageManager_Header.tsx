import {
  Alert,
  Button,
  Divider,
  Input,
  ModalHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
} from '@nextui-org/react';
import {message} from 'antd';
import {isEmpty} from 'lodash';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';

import {PackageInfo, pythonChannels, SitePackages_Info} from '../../../../../cross/CrossExtensions';
import {Add_Icon, Circle_Icon, Download2_Icon} from '../../../../src/assets/icons/SvgIcons/SvgIcons1';

const WARNING_KEY = 'python-package-warning';

type Props = {
  searchValue: string;
  setSearchValue: Dispatch<SetStateAction<string>>;
  packages: PackageInfo[];
  packagesUpdate: SitePackages_Info[];
  checkingUpdates: boolean;
  pythonPath: string;
  allUpdated: () => void;
  refresh: () => void;
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
}: Props) {
  const [showWarning, setShowWarning] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [installing, setInstalling] = useState<boolean>(false);

  const [installPackageName, setInstallPackageName] = useState<string>('');
  const [installPopover, setInstallPopover] = useState<boolean>(false);

  useEffect(() => {
    setShowWarning(localStorage.getItem(WARNING_KEY) !== 'false');
  }, []);

  const onWarningClose = () => {
    setShowWarning(false);
    localStorage.setItem(WARNING_KEY, 'false');
  };

  const updateAll = () => {
    setIsUpdating(true);
    const updateList = packagesUpdate.map(item => item.name);
    window.electron.ipcRenderer
      .invoke(pythonChannels.updateAllPackages, pythonPath, updateList)
      .then(() => {
        message.success(`All ${updateList.length} packages updated.`);
        allUpdated();
      })
      .catch(() => {
        message.error(`Something goes wrong when updating.`);
      })
      .finally(() => {
        setIsUpdating(false);
      });
  };

  const installPackage = () => {
    setInstallPopover(false);
    setInstalling(true);
    window.electron.ipcRenderer
      .invoke(pythonChannels.installPackage, pythonPath, installPackageName)
      .then(() => {
        message.success(`${installPackageName} installed successfully.`);
        setInstallPackageName('');
        refresh();
      })
      .catch(e => {
        console.log(e);
        message.error(`Something goes wrong when installing ${installPackageName}.`);
      })
      .finally(() => {
        setInstalling(false);
      });
  };

  return (
    <ModalHeader className="bg-foreground-200 dark:bg-LynxRaisinBlack items-center flex-col gap-y-2">
      <div className="flex flex-row justify-between w-full">
        <span>Package Manager ({packages.length})</span>
        <div className="gap-x-2 flex items-center">
          {!isEmpty(packagesUpdate) && (
            <Button
              size="sm"
              radius="sm"
              variant="flat"
              color="success"
              onPress={updateAll}
              isLoading={isUpdating}
              startContent={!isUpdating && <Download2_Icon />}>
              {isUpdating ? <span>Updating...</span> : <span>Update All ({packagesUpdate.length})</span>}
            </Button>
          )}
          {checkingUpdates && (
            <Spinner
              size="sm"
              color="success"
              labelColor="success"
              label="Checking for updates..."
              classNames={{base: 'flex-row', label: 'text-tiny'}}
            />
          )}
          <Popover size="sm" radius="sm" placement="bottom" isOpen={installPopover} onOpenChange={setInstallPopover}>
            <PopoverTrigger>
              <Button
                size="sm"
                radius="sm"
                variant="solid"
                isLoading={installing}
                startContent={!installing && <Add_Icon />}>
                {installing ? <span>Installing {installPackageName}...</span> : <span>Install Package</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="py-4 gap-y-2">
              <span className="font-bold text-[11pt]">Install Python Package</span>
              <Divider />
              <Input
                size="sm"
                label="Package Name:"
                value={installPackageName}
                placeholder="Enter package name..."
                onValueChange={setInstallPackageName}
              />
              <Button size="sm" onPress={installPackage} fullWidth>
                Install
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <Input
        size="sm"
        radius="sm"
        className="pt-1"
        value={searchValue}
        startContent={<Circle_Icon />}
        onValueChange={setSearchValue}
        placeholder="Search packages..."
      />
      <Alert
        color="warning"
        className="w-full"
        title="Update Warning"
        isVisible={showWarning}
        onClose={onWarningClose}
        description="Be carfull updating packagin may break usage, for WebUI's use card menu to manage packages."
        showIcon
      />
    </ModalHeader>
  );
}
