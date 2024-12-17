import {Button, Modal, ModalContent, ModalFooter} from '@nextui-org/react';
import {isEmpty} from 'lodash';
import {Dispatch, ReactNode, SetStateAction, useEffect, useState} from 'react';

import {PackageInfo, SitePackages_Info} from '../../../../../cross/CrossExtensions';
import {modalMotionProps} from '../../../../src/App/Utils/Constants';
import {searchInStrings} from '../../../../src/App/Utils/UtilFunctions';
import pIpc from '../../../PIpc';
import PackageManagerBody from './PackageManager_Body';
import PackageManagerHeader from './PackageManager_Header';

type Props = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  pythonPath: string;

  title?: string;
  actionButtons?: ReactNode[];
  size?: '2xl' | '3xl' | '4xl';

  locateVenv?: () => void;
  isLocating?: boolean;
};

export default function PackageManagerModal({
  title = 'Package Manager',
  size = '2xl',
  actionButtons,
  isOpen,
  setIsOpen,
  pythonPath,
  locateVenv,
  isLocating,
}: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingUpdates, setIsLoadingUpdates] = useState<boolean>(false);

  useEffect(() => {
    console.log('isl: ', isLoading);
  }, [isLoading]);

  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const [packagesUpdate, setPackagesUpdate] = useState<SitePackages_Info[]>([]);

  const [searchValue, setSearchValue] = useState<string>('');
  const [searchData, setSearchData] = useState<PackageInfo[]>([]);

  const [isValidPython, setIsValidPython] = useState<boolean>(true);

  useEffect(() => {
    if (isEmpty(pythonPath)) setIsValidPython(false);
  }, [pythonPath]);

  useEffect(() => {
    setSearchData(packages.filter(item => searchInStrings(searchValue, [item.name])));
  }, [searchValue, packages]);

  const closePackageManager = () => {
    setIsOpen(false);
  };

  const checkForUpdates = () => {
    setIsLoadingUpdates(true);

    pIpc
      .getPackagesUpdateInfo(pythonPath)
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
  };

  const getPackageList = () => {
    setIsLoading(true);

    console.log('getting: ', pythonPath);
    pIpc
      .getPackagesInfo(pythonPath)
      .then(result => {
        setPackages(result);
        setIsValidPython(true);
      })
      .catch(err => {
        setIsValidPython(false);
        console.warn(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (isOpen && !isEmpty(pythonPath)) getPackageList();
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
      size={size}
      isOpen={isOpen}
      isDismissable={false}
      scrollBehavior="inside"
      onClose={closePackageManager}
      motionProps={modalMotionProps}
      classNames={{backdrop: '!top-10', wrapper: '!top-10 pb-8'}}
      hideCloseButton>
      <ModalContent className="overflow-hidden">
        <PackageManagerHeader
          title={title}
          packages={packages}
          allUpdated={allUpdated}
          pythonPath={pythonPath}
          refresh={getPackageList}
          searchValue={searchValue}
          isValidPython={isValidPython}
          actionButtons={actionButtons}
          packagesUpdate={packagesUpdate}
          setSearchValue={setSearchValue}
          checkForUpdates={checkForUpdates}
          checkingUpdates={!isLoading && isLoadingUpdates}
        />
        <PackageManagerBody
          removed={removed}
          updated={updated}
          isLoading={isLoading}
          locateVenv={locateVenv}
          isLocating={isLocating}
          searchData={searchData}
          pythonPath={pythonPath}
          isValidPython={isValidPython}
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
