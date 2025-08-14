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
import {message, Spin} from 'antd';
import {SHA256} from 'crypto-js';
import {isNil} from 'lodash';
import {FormEvent, useEffect, useMemo, useState} from 'react';

import rendererIpc from '../../../../../../src/renderer/src/App/RendererIpc';
import {MenuDots_Icon, OpenFolder_Icon} from '../../../../../../src/renderer/src/assets/icons/SvgIcons/SvgIcons';
import {formatSizeMB} from '../../../../cross/CrossExtUtils';
import pIpc from '../../../PIpc';
import {Env_Icon, HardDrive_Icon, Packages_Icon, TrashDuo_Icon} from '../../SvgIcons';
import PackageManagerModal from '../PackageManagement/PackageManager/PackageManagerModal';
import Venv_Associate from './Venv_Associate';

const TITLE_STORE_KEY = 'title_change_key';
type StorageItem = {title: string; path: string};

type Props = {
  title: string;
  pythonVersion: string;
  installedPackages: number;
  folder: string;
  pythonPath: string;
  diskUsage: {path: string; value: number | undefined}[];
  refresh: () => void;
  show: string;
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
}: Props) {
  const [popoverUninstaller, setPopoverUninstaller] = useState<boolean>(false);
  const [editedTitle, setEditedTitle] = useState<string>(title);

  useEffect(() => {
    const storedItems: StorageItem[] = JSON.parse(localStorage.getItem(TITLE_STORE_KEY) || '[]');

    const existingTitle = storedItems.find(item => item.path === SHA256(folder).toString());

    if (existingTitle) setEditedTitle(existingTitle.title);
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
        message.success(`Environment "${title}" removed successfully.`);
        pIpc.removeAssociatePath(pythonPath);
        refresh();
      })
      .catch(error => {
        console.error(error);
        message.error(`Failed to remove environment "${title}".`);
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

    const storedItems: StorageItem[] = JSON.parse(localStorage.getItem(TITLE_STORE_KEY) || '[]');

    const existingIndex = storedItems.findIndex(item => item.path === SHA256(folder).toString());

    if (existingIndex > -1) {
      storedItems[existingIndex].title = textContent;
    } else {
      storedItems.push({path: SHA256(folder).toString(), title: textContent});
    }

    localStorage.setItem(TITLE_STORE_KEY, JSON.stringify(storedItems));
  };

  const [packageManagerOpen, setPackageManagerOpen] = useState<boolean>(false);
  const packageManager = () => {
    setPackageManagerOpen(true);
  };

  return (
    <>
      <PackageManagerModal
        size="3xl"
        show={show}
        id={pythonPath}
        pythonPath={pythonPath}
        isOpen={packageManagerOpen}
        setIsOpen={setPackageManagerOpen}
      />
      <Card
        className={
          'min-w-[27rem] grow border-1 transition-all border-foreground/10 hover:border-foreground/20 cursor-default'
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

            <Popover
              size="sm"
              color="danger"
              placement="left"
              className="max-w-[15rem]"
              isOpen={popoverUninstaller}
              onOpenChange={setPopoverUninstaller}
              showArrow>
              <PopoverTrigger>
                <Button size="sm" color="danger" variant="light" isLoading={isRemoving} isIconOnly>
                  <TrashDuo_Icon className="size-[50%]" />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="p-2 space-y-2">
                  <span>{`Permanently delete '${title}' and all its contents? This action cannot be undone.`}</span>
                  <Button size="sm" onPress={remove} fullWidth>
                    Yes, Delete
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>

        <CardBody className="gap-y-4 px-4 flex flex-col text-sm">
          <Button size="sm" variant="light" onPress={openPath} className="flex flex-row justify-start -ml-3 -mb-1.5">
            <OpenFolder_Icon className="flex-shrink-0" />
            <span className="truncate">{folder}</span>
          </Button>
          <div className="w-full justify-between flex flex-row">
            <div className="flex flex-row gap-x-2 items-center">
              <Packages_Icon className="size-3" />
              <span>Installed Packages:</span>
            </div>
            <span>{installedPackages}</span>
          </div>
          <div className="w-full justify-between flex flex-row">
            <div className="flex flex-row gap-x-2 items-center">
              <HardDrive_Icon className="size-3" />
              <span>Disk Usage:</span>
            </div>
            {isNil(size) ? <Spin size="small" /> : <span>{formatSizeMB(size || 0)}</span>}
          </div>
        </CardBody>

        <CardFooter className="flex-col gap-y-3">
          <Venv_Associate type="venv" folder={folder} />
        </CardFooter>
      </Card>
    </>
  );
}
