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
import {useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import rendererIpc from '../../../../../../src/renderer/src/App/RendererIpc';
import {lynxTopToast} from '../../../../../../src/renderer/src/App/Utils/UtilHooks';
import {
  MenuDots_Icon,
  OpenFolder_Icon,
  Refresh3_Icon,
} from '../../../../../../src/renderer/src/assets/icons/SvgIcons/SvgIcons';
import {PythonInstallation} from '../../../../cross/CrossExtTypes';
import {formatSizeMB} from '../../../../cross/CrossExtUtils';
import pIpc from '../../../PIpc';
import {
  CheckCircle_Icon,
  DoubleCheck_Icon,
  HardDrive_Icon,
  Packages_Icon,
  Python_Icon,
  TrashDuo_Icon,
} from '../../SvgIcons';
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
        ? 'border border-secondary/60 hover:border-secondary'
        : python.isLynxHubDefault
          ? 'border border-primary/60 hover:border-primary'
          : 'border border-foreground/10 hover:border-foreground/20';
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
      <Card as="div" className={`min-w-[27rem] grow transition-all cursor-default ${borderColor}`} isPressable>
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
                {window.osPlatform === 'win32' ? (
                  <>
                    <DropdownItem
                      variant="flat"
                      color="secondary"
                      key="system-default"
                      onPress={makeDefault}
                      textValue="Set as System Default"
                      startContent={python.isDefault ? <Refresh3_Icon className="size-4" /> : <DoubleCheck_Icon />}>
                      Set as <span className="font-bold text-secondary">System Default</span>
                    </DropdownItem>
                    <DropdownItem
                      startContent={
                        python.isLynxHubDefault ? <Refresh3_Icon className="size-4" /> : <DoubleCheck_Icon />
                      }
                      variant="flat"
                      color="success"
                      key="lynxhub-default"
                      onPress={makeLynxDefault}
                      textValue="Set as LynxHub Default">
                      Set as <span className="font-bold text-primary">LynxHub Default</span>
                    </DropdownItem>
                  </>
                ) : (
                  <DropdownItem className="hidden" key="system-default" textValue="system_default" />
                )}
                <DropdownItem
                  key="package-manager"
                  onPress={packageManager}
                  startContent={<Packages_Icon className="size-4" />}>
                  Manage Packages
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Popover
              size="sm"
              color="danger"
              placement="left"
              className="max-w-[15rem]"
              isOpen={popoverUninstaller}
              onOpenChange={setPopoverUninstaller}
              showArrow>
              <PopoverTrigger>
                <Button size="sm" color="danger" variant="light" isIconOnly>
                  <TrashDuo_Icon className="size-[50%]" />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="p-2 space-y-2">
                  {python.installationType === 'conda' ? (
                    <span>
                      {`Confirm deletion of the entire Conda environment "${python.condaName}" and` +
                        ` all associated packages. This action is irreversible.`}
                    </span>
                  ) : (
                    <span>
                      {`Confirm uninstallation of Python version ${python.version} and deletion of all` +
                        ` associated packages. This action is irreversible.`}
                    </span>
                  )}
                  <Button size="sm" onPress={uninstall} fullWidth>
                    Uninstall
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>

        <CardBody className="gap-y-4 px-4 flex flex-col text-sm">
          <Button size="sm" variant="light" onPress={openPath} className="flex flex-row justify-start -ml-3 -mb-1.5">
            <OpenFolder_Icon className="flex-shrink-0" />
            <span className="truncate">{python.installFolder}</span>
          </Button>
          <div className="w-full justify-between flex flex-row">
            <div className="flex flex-row gap-x-2 items-center">
              <Packages_Icon className="size-3" />
              <span>Installed Packages:</span>
            </div>
            <span>{python.packages}</span>
          </div>
          <Progress
            label={
              <div className="flex flex-row gap-x-2 items-center">
                <HardDrive_Icon className="size-3" />
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
          <Venv_Associate type="python" folder={python.installFolder} />
        </CardFooter>
      </Card>
    </div>
  );
}
