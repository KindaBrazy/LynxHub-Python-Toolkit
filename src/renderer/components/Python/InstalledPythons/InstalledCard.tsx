import {
  Button,
  Card,
  Chip,
  Description,
  Dropdown,
  Label,
  Popover,
  ProgressBar,
  Separator,
  Spinner,
  useOverlayState,
} from '@heroui-v3/react';
import {topToast} from '@lynx/layouts/ToastProviders';
import filesIpc from '@lynx_shared/ipc/files';
import {
  BoxMinimalistic,
  CheckCircle,
  Diskette,
  FolderOpen,
  MenuDots,
  Refresh,
  TrashBin2,
} from '@solar-icons/react-perf/BoldDuotone';
import {CheckRead} from '@solar-icons/react-perf/LineDuotone';
import {isNil, startCase} from 'lodash-es';
import {X} from 'lucide-react';
import {useCallback, useMemo, useState} from 'react';

import {PythonInstallation} from '../../../../cross/CrossExtTypes';
import {formatSizeMB} from '../../../../cross/CrossExtUtils';
import pIpc from '../../../PIpc';
import {Python_Icon} from '../../SvgIcons';
import PackageManagerModal from '../PackageManagement/PackageManager/PackageManagerModal';
import Venv_Associate from '../VirtualEnvironments/Venv_Associate';

type Props = {
  python: PythonInstallation;
  diskUsage: {path: string; value: number | undefined}[];
  maxDiskValue: number;
  updateDefault: (installFolder: string, type: 'isDefault' | 'isLynxHubDefault') => void;
  refresh: (research: boolean) => void;
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
        topToast.success(`Python ${python.version} is now the system default.`);
        updateDefault(python.installFolder, 'isDefault');
      })
      .catch(error => {
        topToast.danger(`Failed to set ${python.version} as system default. Please try again later.`);
        console.error(error);
      });
  };

  const makeLynxDefault = () => {
    const showFailedToast = () => {
      topToast.danger(`Failed to set ${python.version} as LynxHub default. Please try again later.`);
    };
    pIpc
      .replacePythonPath(python.installFolder)
      .then(result => {
        if (result) {
          topToast.success(`Python ${python.version} is now the default for LynxHub.`);
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
    filesIpc.openPath(python.installFolder);
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

  const packageManagerModal = useOverlayState();

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
        <Chip size="sm" variant="soft" color="success" className="font-semibold! px-2">
          <CheckCircle />
          System & LynxHub
        </Chip>
      );
    }

    if (python.isDefault) {
      return (
        <Chip size="sm" variant="soft" color="default" className="font-semibold! px-2">
          <CheckCircle />
          System
        </Chip>
      );
    }

    if (python.isLynxHubDefault) {
      return (
        <Chip size="sm" variant="soft" color="accent" className="font-semibold! px-2">
          <CheckCircle />
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
        id={python.installPath}
        state={packageManagerModal}
        pythonPath={python.installPath}
        onPackagesChanged={() => refresh(false)}
      />
      {isUninstalling && (
        <div className="absolute size-full dark:bg-black/50 bg-white/50 z-10 flex justify-center items-center">
          <div className={'bg-surface-tertiary shadow-lg p-4 rounded-2xl flex flex-col space-y-2 items-center'}>
            <Spinner size="lg" color="danger" />
            <Description className="text-sm">Uninstalling, Please wait...</Description>
          </div>
        </div>
      )}
      <Card className={`w-120 transition-all duration-200 ${borderColor}`}>
        <Card.Header className="flex flex-row justify-between items-center">
          <div className="flex flex-col">
            <div className="flex flex-row items-center gap-x-2">
              <Python_Icon className="size-4 text-yellow-300" />
              Python {python.version}
              {defaultChip}
            </div>
            <div className="flex items-center gap-x-2">
              <span className="text-tiny text-foreground-500">{python.architecture}</span>
              <Separator className="h-2 w-px" />
              <span className={'text-tiny ' + installTypeColor}>{startCase(python.installationType)}</span>
              {python.installationType === 'conda' && (
                <>
                  <Separator className="h-2 w-px" />
                  <span className={'text-tiny text-cyan-500'}>{python.condaName}</span>
                </>
              )}
            </div>
          </div>
          <div className="space-x-2 flex items-center">
            <Dropdown>
              <Button size="sm" variant="tertiary" isIconOnly>
                <MenuDots className="rotate-90" />
              </Button>
              <Dropdown.Popover>
                <Dropdown.Menu>
                  {window.osPlatform === 'win32' && (
                    <>
                      <Dropdown.Item id="system-default" onPress={makeDefault} textValue="Set as System Default">
                        {python.isDefault ? <Refresh className="size-4" /> : <CheckRead size={16} />}
                        <Label>
                          Set as <span className="font-bold text-LynxPurple">System Default</span>
                        </Label>
                      </Dropdown.Item>
                      <Dropdown.Item id="lynxhub-default" onPress={makeLynxDefault} textValue="Set as LynxHub Default">
                        {python.isLynxHubDefault ? <Refresh className="size-4" /> : <CheckRead size={16} />}
                        <Label>
                          Set as <span className="font-bold text-accent">LynxHub Default</span>
                        </Label>
                      </Dropdown.Item>
                    </>
                  )}
                  <Dropdown.Item id="package-manager" textValue="Manage Packages" onPress={packageManagerModal.open}>
                    <BoxMinimalistic className="size-4" />
                    <Label>Manage Packages</Label>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>

            <Popover isOpen={popoverUninstaller} onOpenChange={setPopoverUninstaller}>
              <Button size="sm" variant="danger-soft" isIconOnly>
                <TrashBin2 />
              </Button>
              <Popover.Content>
                <Popover.Dialog className="max-w-sm">
                  <Popover.Arrow />
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
                      ) : window.osPlatform === 'darwin' ? (
                        <p className="text-xs text-default-600 mt-1">
                          {python.installPath.includes('/Library/Frameworks/Python.framework')
                            ? `Removes Python ${python.version} from /Library/Frameworks and cleans up symlinks.
                             Admin password will be required.`
                            : python.installPath.includes('/opt/homebrew') ||
                                python.installPath.includes('/usr/local/Cellar')
                              ? `Uninstalls Python ${python.version} via Homebrew (brew uninstall).
                               Any AI using this installation will be disconnected.`
                              : `Permanently uninstalls Python ${python.version} and all its packages.
                               Any AI using this installation will be disconnected.`}
                        </p>
                      ) : (
                        <p className="text-xs text-default-600 mt-1">
                          {`Permanently uninstalls Python version ${python.version} and all its packages
                         from your computer. Any AI using this installation will be disconnected.`}
                        </p>
                      )}
                      <Button size="sm" variant="danger" className="mt-2" onPress={uninstall} fullWidth>
                        <TrashBin2 />
                        Uninstall Permanently
                      </Button>
                    </div>

                    {/* A visual separator between the two distinct options */}
                    <Separator />

                    {/* Option 2: Remove from List */}
                    <div>
                      <strong className="text-sm">Remove From List Only</strong>
                      <p className="text-xs text-default-600 mt-1">
                        Removes this entry from the list but does not delete the actual Python installation from your
                        system. Any associated AI will be disconnected, but you can re-link them if you add this
                        installation back later.
                      </p>
                      <Button size="sm" className="mt-2" variant="danger-soft" onPress={removeFromList} fullWidth>
                        <X />
                        Remove from List
                      </Button>
                    </div>
                  </div>
                </Popover.Dialog>
              </Popover.Content>
            </Popover>
          </div>
        </Card.Header>

        <Card.Content className="gap-y-4 py-2 flex flex-col text-sm">
          <Button
            size="sm"
            onPress={openPath}
            variant="tertiary"
            className="flex flex-row justify-start text-xs"
            fullWidth>
            <FolderOpen className="shrink-0 size-3" />
            <span className="truncate">{python.installFolder}</span>
          </Button>
          <div className="w-full justify-between flex flex-row">
            <div className="flex flex-row gap-x-2 items-center">
              <BoxMinimalistic className="size-3" />
              <span>Installed Packages:</span>
            </div>
            <span>{python.packages}</span>
          </div>
          <ProgressBar size="sm" minValue={0} value={size} maxValue={maxDiskValue} isIndeterminate={isNil(size)}>
            <Label className="flex flex-row gap-x-2 items-center">
              <Diskette className="size-3" />
              <span>Disk Usage:</span>
            </Label>
            <ProgressBar.Output>{formatSizeMB(size || 0)}</ProgressBar.Output>
            <ProgressBar.Track>
              <ProgressBar.Fill />
            </ProgressBar.Track>
          </ProgressBar>
        </Card.Content>

        <Card.Footer className="flex-col gap-y-3">
          <Venv_Associate
            folder={python.installFolder}
            type={python.installationType === 'conda' ? 'conda' : 'python'}
          />
        </Card.Footer>
      </Card>
    </div>
  );
}
