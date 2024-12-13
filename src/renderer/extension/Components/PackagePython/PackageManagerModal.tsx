import {Button, Modal, ModalContent, ModalFooter} from '@nextui-org/react';
import {isEmpty} from 'lodash';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';

import {PackageInfo, pythonChannels, SitePackages_Info} from '../../../../cross/CrossExtensions';
import {modalMotionProps} from '../../../src/App/Utils/Constants';
import {searchInStrings} from '../../../src/App/Utils/UtilFunctions';
import PackageManagerBody from './PackageManager_Body';
import PackageManagerHeader from './PackageManager_Header';

type Props = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  pythonPath: string;
};

export default function PackageManagerModal({isOpen, setIsOpen, pythonPath}: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingUpdates, setIsLoadingUpdates] = useState<boolean>(false);

  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const [packagesUpdate, setPackagesUpdate] = useState<SitePackages_Info[]>([]);

  const [searchValue, setSearchValue] = useState<string>('');
  const [searchData, setSearchData] = useState<PackageInfo[]>([]);

  useEffect(() => {
    setSearchData(packages.filter(item => searchInStrings(searchValue, [item.name])));
  }, [searchValue, packages]);

  const closePackageManager = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen && isEmpty(packages)) {
      setIsLoading(true);
      setIsLoadingUpdates(true);

      window.electron.ipcRenderer
        .invoke(pythonChannels.getPackagesUpdateInfo, pythonPath)
        .then((result: SitePackages_Info[]) => {
          setPackagesUpdate(result);
          setPackages(prevState =>
            prevState.map(item => {
              const updateVersion = result.find(update => update.name === item.name)?.version;
              return updateVersion ? {...item, updateVersion} : item;
            }),
          );
        })
        .finally(() => {
          setIsLoadingUpdates(false);
        });

      window.electron.ipcRenderer
        .invoke(pythonChannels.getPackagesInfo, pythonPath)
        .then(setPackages)
        .catch(console.log)
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [pythonPath, isOpen]);

  return (
    <Modal
      size="2xl"
      isOpen={isOpen}
      isDismissable={false}
      scrollBehavior="inside"
      onClose={closePackageManager}
      motionProps={modalMotionProps}
      classNames={{backdrop: '!top-10', wrapper: '!top-10 pb-8'}}
      hideCloseButton>
      <ModalContent className="overflow-hidden">
        <PackageManagerHeader
          packages={packages}
          searchValue={searchValue}
          packagesUpdate={packagesUpdate}
          setSearchValue={setSearchValue}
          checkingUpdates={!isLoading && isLoadingUpdates}
        />
        <PackageManagerBody isLoading={isLoading} searchData={searchData} />
        <ModalFooter className="bg-foreground-200 dark:bg-LynxRaisinBlack">
          <Button size="sm" color="warning" variant="faded" onPress={closePackageManager} fullWidth>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
