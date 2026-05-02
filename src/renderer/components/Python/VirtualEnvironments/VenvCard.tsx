import {Button, Card, Dropdown, Label, Popover, Separator, Spinner, useOverlayState} from '@heroui-v3/react';
import {topToast} from '@lynx/layouts/ToastProviders';
import filesIpc from '@lynx_shared/ipc/files';
import {BoxMinimalistic, Diskette, Folder2, MenuDots, TrashBin2} from '@solar-icons/react-perf/BoldDuotone';
import {SHA256} from 'crypto-js';
import {isNil} from 'lodash-es';
import {X} from 'lucide-react';
import {FormEvent, useCallback, useEffect, useMemo, useState} from 'react';

import {formatSizeMB} from '../../../../cross/CrossExtUtils';
import pIpc from '../../../PIpc';
import {Env_Icon} from '../../SvgIcons';
import PackageManagerModal from '../PackageManagement/PackageManager/PackageManagerModal';
import Venv_Associate from './Venv_Associate';

type Props = {
  title: string;
  pythonVersion: string;
  installedPackages: number;
  folder: string;
  pythonPath: string;
  diskUsage: {path: string; value: number | undefined}[];
  refresh: () => void;
  isInstallation?: boolean;
};

export default function VenvCard({
  title,
  installedPackages,
  pythonVersion,
  folder,
  diskUsage,
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
  }, [diskUsage]);

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
  }, [pythonPath, folder]);

  return (
    <>
      <PackageManagerModal
        id={pythonPath}
        pythonPath={pythonPath}
        state={packageManagerModal}
        onPackagesChanged={refresh}
      />
      <Card className={'w-120 border-2 transition-all duration-200 py-4 border-surface-secondary'}>
        <Card.Header className="flex flex-row justify-between items-center">
          <div className="flex flex-col">
            <div className="flex flex-row items-center gap-x-2">
              <Env_Icon className="size-[1.2rem] text-yellow-300" />
              <span
                spellCheck={false}
                onInput={onTitleChange}
                className="pr-7 cursor-text"
                contentEditable
                suppressContentEditableWarning>
                {editedTitle}
              </span>
            </div>
            <span className="text-tiny text-foreground-500">Python {pythonVersion}</span>
          </div>
          <div className="space-x-2 flex items-center">
            <Dropdown>
              <Button size="sm" variant="tertiary" isIconOnly>
                <MenuDots className="rotate-90" />
              </Button>
              <Dropdown.Popover>
                <Dropdown.Menu onAction={key => console.log(`Selected: ${key}`)}>
                  <Dropdown.Item id="package-manager" textValue="Manage Packages" onPress={packageManagerModal.open}>
                    <BoxMinimalistic className="size-4" />
                    <Label>Manage Packages</Label>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>

            {!isInstallation && (
              <Popover isOpen={popoverUninstaller} onOpenChange={setPopoverUninstaller}>
                <Button size="sm" variant="danger-soft" isPending={isRemoving} isIconOnly>
                  <TrashBin2 />
                </Button>
                <Popover.Content className="max-w-sm">
                  <Popover.Dialog>
                    <Popover.Arrow />
                    <div className="p-2 gap-y-3 flex flex-col">
                      {/* Option 1: Permanent Deletion */}
                      <div>
                        <strong className="text-sm">Delete Environment</strong>
                        <p className="text-xs text-default-600 mt-1">
                          {`Permanently deletes the '${title}' environment folder and all its contents from ` +
                            `your computer. Any AI using this environment will be disconnected.`}
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
                          {`Removes '${title}' from the list but does not delete the environment's files from ` +
                            `your system. Any associated AI will be disconnected, but you can re-link them if ` +
                            `you add this environment back later.`}
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
          </div>
        </Card.Header>

        <Card.Content className="gap-y-4 py-2 flex flex-col text-sm text-foreground">
          <Button
            size="sm"
            onPress={openPath}
            variant="tertiary"
            className="flex flex-row justify-start text-xs"
            fullWidth>
            <Folder2 className="shrink-0 size-3" />
            <span className="truncate">{folder}</span>
          </Button>
          <div className="w-full justify-between flex flex-row">
            <div className="flex flex-row gap-x-2 items-center">
              <BoxMinimalistic className="size-3" />
              <span>Installed Packages:</span>
            </div>
            <span>{installedPackages}</span>
          </div>
          <div className="w-full justify-between flex flex-row">
            <div className="flex flex-row gap-x-2 items-center">
              <Diskette className="size-3" />
              <span>Disk Usage:</span>
            </div>
            {isNil(size) ? <Spinner size="lg" /> : <span>{formatSizeMB(size || 0)}</span>}
          </div>
        </Card.Content>

        <Card.Footer className="flex-col gap-y-3">
          <Venv_Associate folder={folder} type={isInstallation ? 'conda' : 'venv'} />
        </Card.Footer>
      </Card>
    </>
  );
}
