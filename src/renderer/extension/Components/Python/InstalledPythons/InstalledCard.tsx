import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
} from '@nextui-org/react';
import {Card, Divider, Spin} from 'antd';
import {isNil, startCase} from 'lodash';
import {useMemo, useState} from 'react';

import {formatSizeMB} from '../../../../../cross/CrossUtils';
import {PythonInstallation} from '../../../../../cross/extension/CrossExtTypes';
import rendererIpc from '../../../../src/App/RendererIpc';
import {MenuDots_Icon} from '../../../../src/assets/icons/SvgIcons/SvgIcons2';
import {Trash_Icon} from '../../../../src/assets/icons/SvgIcons/SvgIcons3';
import {OpenFolder_Icon, Refresh3_Icon} from '../../../../src/assets/icons/SvgIcons/SvgIcons4';
import {HardDrive_Icon} from '../../../../src/assets/icons/SvgIcons/SvgIcons5';
import pIpc from '../../../PIpc';
import {DoubleCheck_Icon, Packages_Icon, Python_Icon} from '../../SvgIcons';
import PackageManagerModal from '../PackageManagement/PackageManager/PackageManagerModal';

type Props = {
  python: PythonInstallation;
  diskUsage: {path: string; value: number | undefined}[];
  maxDiskValue: number;
  updateDefault: (installFolder: string) => void;
  refresh: () => void;
};

export default function InstalledCard({python, diskUsage, maxDiskValue, updateDefault, refresh}: Props) {
  const size = useMemo(() => {
    return diskUsage.find(usage => usage.path === python.installFolder)?.value;
  }, [diskUsage]);

  const [isUninstalling, setIsUninstalling] = useState<boolean>(false);

  const makeDefault = () => {
    pIpc
      .setDefaultPython(python.installFolder)
      .then(() => {
        updateDefault(python.installFolder);
      })
      .catch(error => {
        console.error(error);
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
        refresh();
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

  return (
    <div className="grow relative">
      <PackageManagerModal
        size="3xl"
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
        className={
          `min-w-[27rem] transition-colors duration-300 shadow-small` +
          ` ${
            python.isDefault
              ? 'border-secondary border-opacity-60 hover:border-opacity-100'
              : 'dark:hover:border-white/20 hover:border-black/20 '
          }`
        }
        title={
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-col my-3">
              <div className="flex flex-row items-center gap-x-2">
                <Python_Icon className="size-4" />
                Python {python.version}
                {python.isDefault && (
                  <Chip
                    size="sm"
                    radius="sm"
                    variant="light"
                    color="secondary"
                    classNames={{content: '!font-semibold'}}>
                    System Default
                  </Chip>
                )}
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
                    key="system-default"
                    onPress={makeDefault}
                    textValue="Set as System Default"
                    startContent={python.isDefault ? <Refresh3_Icon className="size-4" /> : <DoubleCheck_Icon />}>
                    Set as <span className="font-bold">System Default</span>
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
                size="sm"
                color="danger"
                placement="left"
                className="max-w-[15rem]"
                isOpen={popoverUninstaller}
                onOpenChange={setPopoverUninstaller}
                showArrow>
                <PopoverTrigger>
                  <Button size="sm" color="danger" variant="light" isIconOnly>
                    <Trash_Icon className="size-[50%]" />
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
          </div>
        }
        classNames={{body: 'gap-y-4'}}>
        <div className="gap-y-4 flex flex-col">
          <Button size="sm" variant="light" onPress={openPath} className="flex flex-row justify-start -ml-3 -mb-1.5">
            <OpenFolder_Icon className="flex-shrink-0" />
            <span className="truncate">{python.installFolder}</span>
          </Button>
          <div className="w-full justify-between flex flex-row">
            <div className="flex flex-row gap-x-1 items-center">
              <Packages_Icon className="size-3" />
              <span>Installed Packages:</span>
            </div>
            <span>{python.packages}</span>
          </div>
          <Progress
            label={
              <div className="flex flex-row gap-x-2 items-center">
                <HardDrive_Icon />
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
        </div>
      </Card>
    </div>
  );
}
