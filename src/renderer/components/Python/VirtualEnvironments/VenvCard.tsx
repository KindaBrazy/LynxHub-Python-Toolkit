import {Button, Dropdown, Label, Popover, Separator, useOverlayState} from '@heroui/react';
import LynxTooltip from '@lynx/components/LynxTooltip';
import {topToast} from '@lynx/layouts/ToastProviders';
import filesIpc from '@lynx_shared/ipc/files';
import {BoxMinimalistic, MenuDots, TrashBin2} from '@solar-icons/react-perf/BoldDuotone';
import {SHA256} from 'crypto-js';
import {X} from 'lucide-react';
import {FormEvent, useCallback, useEffect, useMemo, useState} from 'react';

import pIpc from '../../../PIpc';
import EnvironmentCard from '../EnvironmentCard';
import PackageManagerModal from '../PackageManagement/PackageManager/PackageManagerModal';

type Props = {
  title: string;
  pythonVersion: string;
  installedPackages: number;
  folder: string;
  pythonPath: string;
  diskUsage: {path: string; value: number | undefined}[];
  maxDiskValue: number;
  refresh: () => void;
  isInstallation?: boolean;
};

export default function VenvCard({
  title,
  installedPackages,
  pythonVersion,
  folder,
  diskUsage,
  maxDiskValue,
  pythonPath,
  refresh,
  isInstallation,
}: Props) {
  const [popoverUninstaller, setPopoverUninstaller] = useState<boolean>(false);
  const [editedTitle, setEditedTitle] = useState<string>(title);

  useEffect(() => {
    pIpc.storage.getVenvCustomTitle().then(storedItems => {
      const existingTitle = storedItems.find(item => item.path === SHA256(folder).toString());

      if (existingTitle) setEditedTitle(existingTitle.title);
    });
  }, [folder]);

  const size = useMemo(() => {
    return diskUsage.find(usage => usage.path === folder)?.value;
  }, [diskUsage, folder]);

  const [isRemoving, setIsRemoving] = useState<boolean>(false);

  const remove = () => {
    setPopoverUninstaller(false);
    setIsRemoving(true);
    filesIpc
      .trashDir(folder)
      .then(() => {
        topToast.success(`Environment "${title}" removed successfully.`);
        pIpc.removeAssociatePath(pythonPath);
        refresh();
      })
      .catch(error => {
        console.error(error);
        topToast.danger(`Failed to remove environment "${title}".`);
      })
      .finally(() => {
        setIsRemoving(false);
      });
  };

  const openPath = () => {
    filesIpc.openPath(folder);
  };

  const onTitleChange = (event: FormEvent<HTMLSpanElement>) => {
    const textContent = event.currentTarget.textContent || '';

    pIpc.storage.getVenvCustomTitle().then(storedItems => {
      const existingIndex = storedItems.findIndex(item => item.path === SHA256(folder).toString());

      if (existingIndex > -1) {
        storedItems[existingIndex].title = textContent;
      } else {
        storedItems.push({path: SHA256(folder).toString(), title: textContent});
      }

      pIpc.storage.setVenvCustomTitle(storedItems);
    });
  };

  const packageManagerModal = useOverlayState();

  const removeFromList = useCallback(() => {
    pIpc.removeAssociatePath(pythonPath);
    pIpc.removeSavedVenv(folder);
    setPopoverUninstaller(false);
    refresh();
  }, [pythonPath, folder, refresh]);

  return (
    <>
      <PackageManagerModal
        id={pythonPath}
        pythonPath={pythonPath}
        state={packageManagerModal}
        onPackagesChanged={refresh}
      />
      <EnvironmentCard
        badges={
          <span
            className={
              'rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-500'
            }>
            {isInstallation ? 'Conda' : 'Venv'}
          </span>
        }
        title={
          <span className="min-w-0 truncate">
            <span
              spellCheck={false}
              onInput={onTitleChange}
              className="cursor-text rounded-md px-1 outline-none transition-colors focus:bg-surface-secondary"
              contentEditable
              suppressContentEditableWarning>
              {editedTitle}
            </span>
          </span>
        }
        actions={
          <>
            <Dropdown>
              <LynxTooltip delay={300} content="Environment actions">
                <Button size="sm" variant="tertiary" isIconOnly>
                  <MenuDots className="rotate-90" />
                </Button>
              </LynxTooltip>
              <Dropdown.Popover>
                <Dropdown.Menu>
                  <Dropdown.Item id="package-manager" textValue="Manage Packages" onPress={packageManagerModal.open}>
                    <BoxMinimalistic className="size-4" />
                    <Label>Manage Packages</Label>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>

            {!isInstallation && (
              <Popover isOpen={popoverUninstaller} onOpenChange={setPopoverUninstaller}>
                <LynxTooltip delay={300} content="Remove environment">
                  <Button size="sm" variant="danger-soft" isPending={isRemoving} isIconOnly>
                    <TrashBin2 />
                  </Button>
                </LynxTooltip>
                <Popover.Content className="max-w-sm">
                  <Popover.Dialog>
                    <Popover.Arrow />
                    <div className="p-2 gap-y-3 flex flex-col">
                      {/* Option 1: Permanent Deletion */}
                      <div>
                        <strong className="text-sm">Delete Environment</strong>
                        <p className="text-xs text-default-600 mt-1">
                          Permanently deletes the "{title}" environment folder and all its contents from your computer.
                          Any AI using this environment will be disconnected.
                        </p>
                        <Button size="sm" variant="danger" className="mt-2" onPress={remove} fullWidth>
                          <TrashBin2 />
                          Delete Permanently
                        </Button>
                      </div>

                      {/* Visual separator */}
                      <Separator />

                      {/* Option 2: Remove from List */}
                      <div>
                        <strong className="text-sm">Remove From List Only</strong>
                        <p className="text-xs text-default-600 mt-1">
                          Removes "{title}" from the list but does not delete the environment's files from your system.
                          Any associated AI will be disconnected, but you can re-link them if you add this environment
                          back later.
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
            )}
          </>
        }
        path={folder}
        diskUsage={size}
        isBusy={isRemoving}
        onOpenPath={openPath}
        maxDiskValue={maxDiskValue}
        packages={installedPackages}
        busyMessage="Removing environment..."
        subtitle={<span>Python {pythonVersion}</span>}
        associationType={isInstallation ? 'conda' : 'venv'}
        iconClassName={isInstallation ? 'text-emerald-400' : 'text-amber-400'}
      />
    </>
  );
}
