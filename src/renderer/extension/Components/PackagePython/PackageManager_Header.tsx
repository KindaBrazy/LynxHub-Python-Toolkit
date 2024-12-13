import {Alert, Button, Input, ModalHeader, Spinner} from '@nextui-org/react';
import {isEmpty} from 'lodash';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';

import {PackageInfo, SitePackages_Info} from '../../../../cross/CrossExtensions';
import {Add_Icon, Circle_Icon, Download2_Icon} from '../../../src/assets/icons/SvgIcons/SvgIcons1';

const WARNING_KEY = 'python-package-warning';

type Props = {
  searchValue: string;
  setSearchValue: Dispatch<SetStateAction<string>>;
  packages: PackageInfo[];
  packagesUpdate: SitePackages_Info[];
  checkingUpdates: boolean;
};

export default function PackageManagerHeader({
  searchValue,
  setSearchValue,
  packages,
  packagesUpdate,
  checkingUpdates,
}: Props) {
  const [showWarning, setShowWarning] = useState<boolean>(true);

  useEffect(() => {
    setShowWarning(localStorage.getItem(WARNING_KEY) !== 'false');
  }, []);

  const onWarningClose = () => {
    setShowWarning(false);
    localStorage.setItem(WARNING_KEY, 'false');
  };

  return (
    <ModalHeader className="bg-foreground-200 dark:bg-LynxRaisinBlack items-center flex-col gap-y-2">
      <div className="flex flex-row justify-between w-full">
        <span>Package Manager ({packages.length})</span>
        <div className="gap-x-2 flex items-center">
          {!isEmpty(packagesUpdate) && (
            <Button size="sm" radius="sm" variant="flat" color="success" startContent={<Download2_Icon />}>
              Update All ({packagesUpdate.length})
            </Button>
          )}
          {checkingUpdates && (
            <Spinner
              size="sm"
              color="success"
              labelColor="success"
              label="Checking for updates..."
              classNames={{base: 'flex-row', label: 'text-tiny'}}
            />
          )}
          <Button size="sm" radius="sm" variant="solid" startContent={<Add_Icon />}>
            Install Package
          </Button>
        </div>
      </div>
      <Input
        size="sm"
        radius="sm"
        className="pt-1"
        value={searchValue}
        startContent={<Circle_Icon />}
        onValueChange={setSearchValue}
        placeholder="Search packages..."
      />
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
