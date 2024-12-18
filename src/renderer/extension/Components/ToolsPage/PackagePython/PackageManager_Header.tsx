import {
  Alert,
  Button,
  ButtonGroup,
  Divider,
  Input,
  ModalHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@nextui-org/react';
import {message} from 'antd';
import {isEmpty} from 'lodash';
import {Dispatch, ReactNode, SetStateAction, useEffect, useState} from 'react';

import {PackageInfo, SitePackages_Info} from '../../../../../cross/CrossExtensions';
import {Add_Icon, Circle_Icon, Download2_Icon} from '../../../../src/assets/icons/SvgIcons/SvgIcons1';
import {Magnifier_Icon} from '../../../../src/assets/icons/SvgIcons/SvgIcons4';
import pIpc from '../../../PIpc';
import RequirementsBtn from './Requirements/RequirementsModal_Btn';

const WARNING_KEY = 'python-package-warning';

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
  checkForUpdates: () => void;

  id: string;
  projectPath?: string;
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
    pIpc
      .updateAllPackages(pythonPath, updateList)
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
    pIpc
      .installPackage(pythonPath, installPackageName)
      .then(() => {
        message.success(`${installPackageName} installed successfully.`);
        setInstallPackageName('');
        refresh();
      })
      .catch(e => {
        console.error(e);
        message.error(`Something goes wrong when installing ${installPackageName}.`);
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
      </div>
      {!isEmpty(packages) && (
        <Input
          size="sm"
          radius="sm"
          className="pt-1"
          value={searchValue}
          startContent={<Circle_Icon />}
          onValueChange={setSearchValue}
          placeholder="Search for packages..."
        />
      )}
      <div className="gap-x-2 flex items-center w-full mt-2">
        <ButtonGroup size="sm" fullWidth>
          {isValidPython &&
            (isEmpty(packagesUpdate) ? (
              <Button
                variant="flat"
                onPress={checkForUpdates}
                isLoading={checkingUpdates}
                startContent={!checkingUpdates && <Magnifier_Icon />}>
                {checkingUpdates ? 'Checking...' : 'Check For Updates'}
              </Button>
            ) : (
              <Button
                radius="sm"
                variant="flat"
                color="success"
                onPress={updateAll}
                isLoading={isUpdating}
                startContent={!isUpdating && <Download2_Icon />}>
                {isUpdating ? <span>Updating...</span> : <span>Update All ({packagesUpdate.length})</span>}
              </Button>
            ))}
          {isValidPython && (
            <>
              <Popover
                size="sm"
                radius="sm"
                placement="bottom"
                isOpen={installPopover}
                onOpenChange={setInstallPopover}>
                <PopoverTrigger>
                  <Button radius="sm" variant="solid" isLoading={installing} startContent={!installing && <Add_Icon />}>
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
                  <div className="w-full">
                    <Button size="sm" onPress={installPackage} fullWidth>
                      Install
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <RequirementsBtn id={id} projectPath={projectPath} />
            </>
          )}
          {actionButtons?.map(ActionButton => ActionButton)}
        </ButtonGroup>
      </div>
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
