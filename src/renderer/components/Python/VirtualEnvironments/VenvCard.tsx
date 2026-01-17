import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@heroui/react';
import {Divider, Spin} from 'antd';
import {SHA256} from 'crypto-js';
import {isNil} from 'lodash';
import {FormEvent, useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {lynxTopToast} from '../../../../../../src/renderer/main_window/hooks/utils';
import rendererIpc from '../../../../../../src/renderer/main_window/ipc';
import {
  BoxDuo_Icon,
  Close_Icon,
  DiskDuo_Icon,
  FolderDuo_Icon,
  MenuDots_Icon,
} from '../../../../../../src/renderer/shared/assets/icons';
import {formatSizeMB} from '../../../../cross/CrossExtUtils';
import pIpc from '../../../PIpc';
import {Env_Icon, Packages_Icon, TrashDuo_Icon} from '../../SvgIcons';
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
  show: string;
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
  show,
  isInstallation,
}: Props) {
  const [popoverUninstaller, setPopoverUninstaller] = useState<boolean>(false);
  const [editedTitle, setEditedTitle] = useState<string>(title);

  const dispatch = useDispatch();

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
    rendererIpc.file
      .trashDir(folder)
      .then(() => {
        lynxTopToast(dispatch).success(`Environment "${title}" removed successfully.`);
        pIpc.removeAssociatePath(pythonPath);
        refresh();
      })
      .catch(error => {
        console.error(error);
        lynxTopToast(dispatch).error(`Failed to remove environment "${title}".`);
      })
      .finally(() => {
        setIsRemoving(false);
      });
  };

  const openPath = () => {
    rendererIpc.file.openPath(folder);
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

  const [packageManagerOpen, setPackageManagerOpen] = useState<boolean>(false);
  const packageManager = () => {
    setPackageManagerOpen(true);
  };

  const removeFromList = useCallback(() => {
    pIpc.removeAssociatePath(pythonPath);
    pIpc.removeSavedVenv(folder);
    setPopoverUninstaller(false);
    refresh();
  }, [pythonPath, folder]);

  return (
    <>
      <PackageManagerModal
        size="3xl"
        show={show}
        id={pythonPath}
        pythonPath={pythonPath}
        isOpen={packageManagerOpen}
        onPackagesChanged={refresh}
        setIsOpen={setPackageManagerOpen}
      />
      <Card
        className={
          'min-w-[27rem] grow border-2 transition-all duration-300 border-foreground-100' +
          ' hover:border-foreground-200 cursor-default'
        }
        as="div"
        isPressable>
        <CardHeader className="flex flex-row justify-between items-center py-1 px-4">
          <div className="flex flex-col my-3">
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
            <Dropdown className="border-1 border-foreground/10">
              <DropdownTrigger>
                <Button size="sm" variant="light" isIconOnly>
                  <MenuDots_Icon className="rotate-90 size-3.5" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu variant="flat">
                <DropdownItem
                  key="package-manager"
                  onPress={packageManager}
                  startContent={<Packages_Icon className="size-4" />}>
                  Package Manager
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

            {!isInstallation && (
              <Popover
                placement="left"
                isOpen={popoverUninstaller}
                onOpenChange={setPopoverUninstaller}
                className="max-w-sm before:bg-foreground-100"
                showArrow>
                <PopoverTrigger>
                  <Button size="sm" color="danger" variant="light" isLoading={isRemoving} isIconOnly>
                    <TrashDuo_Icon className="size-[50%]" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="border border-foreground-100 dark:bg-DarkGray">
                  <div className="p-2 gap-y-3 flex flex-col">
                    {/* Option 1: Permanent Deletion */}
                    <div>
                      <strong className="text-sm">Delete Environment</strong>
                      <p className="text-xs text-default-600 mt-1">
                        {`Permanently deletes the '${title}' environment folder and all its contents from your computer.
                       Any AI using this environment will be disconnected.`}
                      </p>
                      <Button
                        size="sm"
                        color="danger"
                        className="mt-2"
                        onPress={remove}
                        startContent={<TrashDuo_Icon />}
                        fullWidth>
                        Delete Permanently
                      </Button>
                    </div>

                    {/* Visual separator */}
                    <Divider className="my-0" />

                    {/* Option 2: Remove from List */}
                    <div>
                      <strong className="text-sm">Remove From List Only</strong>
                      <p className="text-xs text-default-600 mt-1">
                        {`Removes '${title}' from the list but does not delete the environment's files from your system.
                       Any associated AI will be disconnected, but you can re-link them if you add this
                        environment back later.`}
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
            )}
          </div>
        </CardHeader>

        <CardBody className="gap-y-4 px-4 flex flex-col text-sm">
          <Button size="sm" variant="light" onPress={openPath} className="flex flex-row justify-start -ml-3 -mb-1.5">
            <FolderDuo_Icon className="shrink-0" />
            <span className="truncate">{folder}</span>
          </Button>
          <div className="w-full justify-between flex flex-row">
            <div className="flex flex-row gap-x-2 items-center">
              <BoxDuo_Icon className="size-3" />
              <span>Installed Packages:</span>
            </div>
            <span>{installedPackages}</span>
          </div>
          <div className="w-full justify-between flex flex-row">
            <div className="flex flex-row gap-x-2 items-center">
              <DiskDuo_Icon className="size-3" />
              <span>Disk Usage:</span>
            </div>
            {isNil(size) ? <Spin size="small" /> : <span>{formatSizeMB(size || 0)}</span>}
          </div>
        </CardBody>

        <CardFooter className="flex-col gap-y-3">
          <Venv_Associate folder={folder} type={isInstallation ? 'conda' : 'venv'} />
        </CardFooter>
      </Card>
    </>
  );
}
