import {Button, Chip, Dropdown, Label, Popover, Separator, useOverlayState} from '@heroui/react';
import LynxTooltip from '@lynx/components/LynxTooltip';
import {topToast} from '@lynx/layouts/ToastProviders';
import filesIpc from '@lynx_shared/ipc/files';
import {BoxMinimalistic, CheckCircle, MenuDots, Refresh, TrashBin2} from '@solar-icons/react-perf/BoldDuotone';
import {CheckRead} from '@solar-icons/react-perf/LineDuotone';
import {startCase} from 'lodash-es';
import {X} from 'lucide-react';
import {useCallback, useMemo, useState} from 'react';

import {PythonInstallation} from '../../../../cross/CrossExtTypes';
import pIpc from '../../../PIpc';
import EnvironmentCard from '../EnvironmentCard';
import PackageManagerModal from '../PackageManagement/PackageManager/PackageManagerModal';

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
  }, [diskUsage, python.installFolder]);

  const [isUninstalling, setIsUninstalling] = useState<boolean>(false);

  const makeDefault = () => {
    const confirmed = window.confirm(
      `Set Python ${python.version} as the system default?\n\nTarget path:\n${python.installFolder}\n\nThis updates` +
        ` the Python directory used at the front of PATH for system-default detection. Existing terminals may need` +
        ` to be restarted before they see the change.`,
    );

    if (!confirmed) return;

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
    const confirmed = window.confirm(
      `Set Python ${python.version} as the LynxHub default?\n\nTarget path:\n${python.installFolder}\n\nThis` +
        ` changes the PATH used by LynxHub-run tools so new Python package operations use this installation first.`,
    );

    if (!confirmed) return;

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

  const installTypeClassName = useMemo(() => {
    switch (python.installationType) {
      case 'official':
        return 'border-success/30 bg-success/10 text-success';
      case 'conda':
        return 'border-accent/30 bg-accent/10 text-accent';
      case 'other':
        return 'border-warning/30 bg-warning/10 text-warning';
    }
  }, [python.installationType]);

  const [popoverUninstaller, setPopoverUninstaller] = useState<boolean>(false);

  const packageManagerModal = useOverlayState();

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
  }, [python.installPath, refresh]);

  return (
    <>
      <PackageManagerModal
        id={python.installPath}
        state={packageManagerModal}
        pythonPath={python.installPath}
        onPackagesChanged={() => refresh(false)}
      />
      <EnvironmentCard
        title={
          <>
            <span>Python {python.version}</span>
            {defaultChip}
          </>
        }
        subtitle={
          <>
            <span>{python.architecture}</span>
            <span className="text-muted/60">/</span>
            <span>{python.installationType === 'conda' ? 'Conda managed runtime' : 'Standalone runtime'}</span>
          </>
        }
        badges={
          <>
            <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${installTypeClassName}`}>
              {startCase(python.installationType)}
            </span>
            {python.installationType === 'conda' && python.condaName && (
              <span
                className={
                  'rounded-md border border-cyan-500/25 bg-cyan-500/10 px-2 py-0.5 text-xs font-medium text-cyan-500'
                }>
                {python.condaName}
              </span>
            )}
          </>
        }
        actions={
          <>
            <Dropdown>
              <LynxTooltip delay={300} content="Python actions">
                <Button size="sm" variant="tertiary" isIconOnly>
                  <MenuDots className="rotate-90" />
                </Button>
              </LynxTooltip>
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
              <LynxTooltip delay={300} content="Remove Python">
                <Button size="sm" variant="danger-soft" isIconOnly>
                  <TrashBin2 />
                </Button>
              </LynxTooltip>
              <Popover.Content>
                <Popover.Dialog className="max-w-sm">
                  <Popover.Arrow />
                  <div className="p-2 gap-y-3 flex flex-col">
                    {/* Option 1: Full Uninstall */}
                    <div>
                      <strong className="text-sm">Complete Uninstall</strong>
                      {python.installationType === 'conda' ? (
                        <p className="text-xs text-default-600 mt-1">
                          Permanently deletes the entire Conda environment "{python.condaName}" and all its packages
                          from your computer. Any AI using this environment will be disconnected.
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
                          Permanently uninstalls Python version {python.version} and all its packages from your
                          computer. Any AI using this installation will be disconnected.
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
          </>
        }
        diskUsage={size}
        onOpenPath={openPath}
        isBusy={isUninstalling}
        packages={python.packages}
        path={python.installFolder}
        maxDiskValue={maxDiskValue}
        iconClassName="text-blue-400"
        busyMessage="Uninstalling, please wait..."
        associationType={python.installationType === 'conda' ? 'conda' : 'python'}
      />
    </>
  );
}
