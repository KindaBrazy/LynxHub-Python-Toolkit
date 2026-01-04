import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
} from '@heroui/react';
import {Divider, Spin} from 'antd';
import {isNil, startCase} from 'lodash';
import {useCallback, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import rendererIpc from '../../../../../../src/renderer/src/App/RendererIpc';
import {lynxTopToast} from '../../../../../../src/renderer/src/App/Utils/UtilHooks';
import {
  BoxDuo_Icon,
  Close_Icon,
  DiskDuo_Icon,
  FolderDuo_Icon,
  MenuDots_Icon,
  RefreshDuo_Icon,
} from '../../../../../../src/renderer/src/assets/icons/SvgIcons/SvgIcons';
import {PythonInstallation} from '../../../../cross/CrossExtTypes';
import {formatSizeMB} from '../../../../cross/CrossExtUtils';
import pIpc from '../../../PIpc';
import {CheckCircle_Icon, DoubleCheck_Icon, Packages_Icon, Python_Icon, TrashDuo_Icon} from '../../SvgIcons';
import PackageManagerModal from '../PackageManagement/PackageManager/PackageManagerModal';
import Venv_Associate from '../VirtualEnvironments/Venv_Associate';

type Props = {
  python: PythonInstallation;
  diskUsage: {path: string; value: number | undefined}[];
  maxDiskValue: number;
  updateDefault: (installFolder: string, type: 'isDefault' | 'isLynxHubDefault') => void;
  refresh: (research: boolean) => void;
  show: string;
};

export default function InstalledCard({python, diskUsage, maxDiskValue, updateDefault, refresh, show}: Props) {
  const size = useMemo(() => {
    return diskUsage.find(usage => usage.path === python.installFolder)?.value;
  }, [diskUsage]);

  const [isUninstalling, setIsUninstalling] = useState<boolean>(false);
  const dispatch = useDispatch();

  const makeDefault = () => {
    pIpc
      .setDefaultPython(python.installFolder)
      .then(() => {
        lynxTopToast(dispatch).success(`Python ${python.version} is now the system default.`);
        updateDefault(python.installFolder, 'isDefault');
      })
      .catch(error => {
        lynxTopToast(dispatch).error(`Failed to set ${python.version} as system default. Please try again later.`);
        console.error(error);
      });
  };

  const makeLynxDefault = () => {
    const showFailedToast = () => {
      lynxTopToast(dispatch).error(`Failed to set ${python.version} as LynxHub default. Please try again later.`);
    };
    pIpc
      .replacePythonPath(python.installFolder)
      .then(result => {
        if (result) {
          lynxTopToast(dispatch).success(`Python ${python.version} is now the default for LynxHub.`);
          updateDefault(python.installFolder, 'isLynxHubDefault');
        } else {
          showFailedToast();
        }
      })
      .catch(e => {
        console.log(e);
        showFailedToast();
      });
  };

  const uninstall = () => {
    setPopoverUninstaller(false);
    setIsUninstalling(true);
    pIpc
      .uninstallPython(python.installPath)
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        pIpc.removeAssociatePath(python.installPath);
        pIpc.removeSavedPython(python.installPath);
        refresh(false);
        setIsUninstalling(false);
      });
  };

  const openPath = () => {
    rendererIpc.file.openPath(python.installFolder);
  };

  const installTypeColor = useMemo(() => {
    switch (python.installationType) {
      case 'official':
        return 'text-[#28A745]';
      case 'conda':
        return 'text-[#007BFF]';
      case 'other':
        return 'text-[#FFA500]';
    }
  }, [python.installationType]);

  const [popoverUninstaller, setPopoverUninstaller] = useState<boolean>(false);

  const [packageManagerOpen, setPackageManagerOpen] = useState<boolean>(false);

  const packageManager = () => {
    setPackageManagerOpen(true);
  };

  const borderColor = useMemo(() => {
    return python.isDefault && python.isLynxHubDefault
      ? 'border-2 border-success/60 hover:border-success'
      : python.isDefault
        ? 'border-2 border-secondary/60 hover:border-secondary'
        : python.isLynxHubDefault
          ? 'border-2 border-primary/60 hover:border-primary'
          : 'border-2 border-foreground-100 hover:border-foreground-200';
  }, [python]);

  const defaultChip = useMemo(() => {
    if (python.isDefault && python.isLynxHubDefault) {
      return (
        <Chip
          size="sm"
          radius="sm"
          variant="flat"
          color="success"
          startContent={<CheckCircle_Icon />}
          classNames={{content: '!font-semibold'}}>
          System & LynxHub
        </Chip>
      );
    }

    if (python.isDefault) {
      return (
        <Chip
          size="sm"
          radius="sm"
          variant="light"
          color="secondary"
          startContent={<CheckCircle_Icon />}
          classNames={{content: '!font-semibold'}}>
          System
        </Chip>
      );
    }

    if (python.isLynxHubDefault) {
      return (
        <Chip
          size="sm"
          radius="sm"
          variant="light"
          color="primary"
          startContent={<CheckCircle_Icon />}
          classNames={{content: '!font-semibold'}}>
          LynxHub
        </Chip>
      );
    }

    return null;
  }, [python]);

  const removeFromList = useCallback(() => {
    pIpc.removeAssociatePath(python.installPath);
    pIpc.removeSavedPython(python.installPath);
    setPopoverUninstaller(false);
    refresh(false);
  }, [python]);

  return (
    <div className="grow relative">
      <PackageManagerModal
        size="3xl"
        show={show}
        id={python.installPath}
        isOpen={packageManagerOpen}
        pythonPath={python.installPath}
        setIsOpen={setPackageManagerOpen}
      />
      {isUninstalling && (
        <div className="absolute size-full dark:bg-black/50 bg-white/50 z-10 flex justify-center items-center">
          <div className=" dark:bg-black/80 bg-white/80 p-4 rounded-lg flex flex-col space-y-2">
            <Spin />
            <span>Uninstalling... Please wait.</span>
          </div>
        </div>
      )}
      <Card
        as="div"
        className={`min-w-[27rem] grow transition-all duration-300 cursor-default ${borderColor}`}
        isPressable>
        <CardHeader className="flex flex-row justify-between items-center py-1 px-4">
          <div className="flex flex-col my-3">
            <div className="flex flex-row items-center gap-x-2">
              <Python_Icon className="size-4 text-yellow-300" />
              Python {python.version}
              {defaultChip}
            </div>
            <div>
              <span className="text-tiny text-foreground-500">{python.architecture}</span>
              <Divider type="vertical" />
              <span className={'text-tiny ' + installTypeColor}>{startCase(python.installationType)}</span>
              {python.installationType === 'conda' && (
                <>
                  <Divider type="vertical" />
                  <span className={'text-tiny text-cyan-500'}>{python.condaName}</span>
                </>
              )}
            </div>
          </div>
          <div className="space-x-1 flex items-center">
            <Dropdown className="dark:bg-LynxRaisinBlack">
              <DropdownTrigger>
                <Button size="sm" variant="light" isIconOnly>
                  <MenuDots_Icon className="rotate-90 size-3.5" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem
                  variant="flat"
                  color="secondary"
                  key="system-default"
                  onPress={makeDefault}
                  textValue="Set as System Default"
                  startContent={python.isDefault ? <RefreshDuo_Icon className="size-4" /> : <DoubleCheck_Icon />}>
                  Set as <span className="font-bold text-secondary">System Default</span>
                </DropdownItem>
                <DropdownItem
                  startContent={python.isLynxHubDefault ? <RefreshDuo_Icon className="size-4" /> : <DoubleCheck_Icon />}
                  variant="flat"
                  color="success"
                  key="lynxhub-default"
                  onPress={makeLynxDefault}
                  textValue="Set as LynxHub Default">
                  Set as <span className="font-bold text-primary">LynxHub Default</span>
                </DropdownItem>
                <DropdownItem
                  key="package-manager"
                  onPress={packageManager}
                  startContent={<Packages_Icon className="size-4" />}>
                  Manage Packages
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Popover
              placement="left"
              isOpen={popoverUninstaller}
              onOpenChange={setPopoverUninstaller}
              className="max-w-sm before:bg-foreground-100"
              showArrow>
              <PopoverTrigger>
                <Button size="sm" color="danger" variant="light" isIconOnly>
                  <TrashDuo_Icon className="size-[50%]" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="border border-foreground-100 dark:bg-DarkGray">
                <div className="p-2 gap-y-3 flex flex-col">
                  {/* Option 1: Full Uninstall */}
                  <div>
                    <strong className="text-sm">Complete Uninstall</strong>
                    {python.installationType === 'conda' ? (
                      <p className="text-xs text-default-600 mt-1">
                        {`Permanently deletes the entire Conda environment "${python.condaName}" and all
                         its packages from your computer. Any AI using this environment will be
                          disconnected.`}
                      </p>
                    ) : (
                      <p className="text-xs text-default-600 mt-1">
                        {`Permanently uninstalls Python version ${python.version} and all its packages
                         from your computer. Any AI using this installation will be disconnected.`}
                      </p>
                    )}
                    <Button
                      size="sm"
                      color="danger"
                      className="mt-2"
                      onPress={uninstall}
                      startContent={<TrashDuo_Icon />}
                      fullWidth>
                      Uninstall Permanently
                    </Button>
                  </div>

                  {/* A visual separator between the two distinct options */}
                  <Divider className="my-0" />

                  {/* Option 2: Remove from List */}
                  <div>
                    <strong className="text-sm">Remove From List Only</strong>
                    <p className="text-xs text-default-600 mt-1">
                      Removes this entry from the list but does not delete the actual Python installation from your
                      system. Any associated AI will be disconnected, but you can re-link them if you add this
                      installation back later.
                    </p>
                    <Button
                      size="sm"
                      color="warning"
                      className="mt-2"
                      onPress={removeFromList}
                      startContent={<Close_Icon />}
                      fullWidth>
                      Remove from List
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>

        <CardBody className="gap-y-4 px-4 flex flex-col text-sm">
          <Button size="sm" variant="light" onPress={openPath} className="flex flex-row justify-start -ml-3 -mb-1.5">
            <FolderDuo_Icon className="shrink-0" />
            <span className="truncate">{python.installFolder}</span>
          </Button>
          <div className="w-full justify-between flex flex-row">
            <div className="flex flex-row gap-x-2 items-center">
              <BoxDuo_Icon className="size-3" />
              <span>Installed Packages:</span>
            </div>
            <span>{python.packages}</span>
          </div>
          <Progress
            label={
              <div className="flex flex-row gap-x-2 items-center">
                <DiskDuo_Icon className="size-3" />
                <span>Disk Usage:</span>
              </div>
            }
            size="sm"
            minValue={0}
            value={size}
            color="primary"
            maxValue={maxDiskValue}
            isIndeterminate={isNil(size)}
            valueLabel={formatSizeMB(size || 0)}
            showValueLabel
          />
        </CardBody>

        <CardFooter className="flex-col gap-y-3">
          <Venv_Associate
            folder={python.installFolder}
            type={python.installationType === 'conda' ? 'conda' : 'python'}
          />
        </CardFooter>
      </Card>
    </div>
  );
}
