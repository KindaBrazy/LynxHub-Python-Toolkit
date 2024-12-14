import {Button, Modal, ModalContent, ModalFooter} from '@nextui-org/react';
import {isEmpty} from 'lodash';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';

import {PackageInfo, pythonChannels, SitePackages_Info} from '../../../../../cross/CrossExtensions';
import {modalMotionProps} from '../../../../src/App/Utils/Constants';
import {searchInStrings} from '../../../../src/App/Utils/UtilFunctions';
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

  const getPackageList = () => {
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
  };

  useEffect(() => {
    if (isOpen && isEmpty(packages)) getPackageList();
  }, [pythonPath, isOpen]);

  const updated = (name: string, newVersion: string) => {
    setPackagesUpdate(prevState => prevState.filter(item => item.name !== name));
    setPackages(prevState =>
      prevState.map(item => (item.name === name ? {name, updateVersion: undefined, version: newVersion} : item)),
    );
  };

  const removed = (name: string) => {
    setPackagesUpdate(prevState => prevState.filter(item => item.name !== name));
    setPackages(prevState => prevState.filter(item => item.name !== name));
  };

  const allUpdated = () => {
    setPackages(prevState =>
      prevState.map(item => {
        const newVersion = packagesUpdate.find(update => update.name === item.name)?.version;
        return newVersion ? {name: item.name, updateVersion: undefined, version: newVersion} : item;
      }),
    );
    setPackagesUpdate([]);
  };

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
          allUpdated={allUpdated}
          pythonPath={pythonPath}
          refresh={getPackageList}
          searchValue={searchValue}
          packagesUpdate={packagesUpdate}
          setSearchValue={setSearchValue}
          checkingUpdates={!isLoading && isLoadingUpdates}
        />
        <PackageManagerBody
          removed={removed}
          updated={updated}
          isLoading={isLoading}
          pythonPath={pythonPath}
          searchData={searchData}
        />
        <ModalFooter className="bg-foreground-200 dark:bg-LynxRaisinBlack">
          <Button size="sm" color="warning" variant="faded" onPress={closePackageManager} fullWidth>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
