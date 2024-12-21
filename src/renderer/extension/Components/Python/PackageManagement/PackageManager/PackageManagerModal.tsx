import {Button, Modal, ModalContent, ModalFooter, Selection} from '@nextui-org/react';
import {isEmpty} from 'lodash';
import {Dispatch, ReactNode, SetStateAction, useEffect, useState} from 'react';

import {FilterKeys, PackageInfo, SitePackages_Info} from '../../../../../../cross/extension/CrossExtTypes';
import {getUpdateType} from '../../../../../../cross/extension/CrossExtUtils';
import {modalMotionProps} from '../../../../../src/App/Utils/Constants';
import {searchInStrings} from '../../../../../src/App/Utils/UtilFunctions';
import pIpc from '../../../../PIpc';
import PackageManagerBody from './Body';
import Footer_TablePage from './Footer_TablePage';
import PackageManagerHeader from './Header';

type Props = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  pythonPath: string;

  title?: string;
  actionButtons?: ReactNode[];
  size?: '2xl' | '3xl' | '4xl';

  locateVenv?: () => void;
  isLocating?: boolean;

  id: string;
  projectPath?: string;
};

export default function PackageManagerModal({
  title = 'Package Manager',
  size = '2xl',
  actionButtons,
  isOpen,
  setIsOpen,
  pythonPath,
  locateVenv,
  id,
  isLocating,
  projectPath,
}: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingUpdates, setIsLoadingUpdates] = useState<boolean>(false);

  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<PackageInfo[]>([]);
  const [packagesUpdate, setPackagesUpdate] = useState<SitePackages_Info[]>([]);

  const [searchValue, setSearchValue] = useState<string>('');
  const [searchData, setSearchData] = useState<PackageInfo[]>([]);

  const [isValidPython, setIsValidPython] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<FilterKeys>('all');

  const [items, setItems] = useState<PackageInfo[]>(searchData);
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));

  useEffect(() => {
    switch (selectedFilter) {
      case 'all':
        setFilteredPackages(packages);
        break;
      case 'updates':
        setFilteredPackages(packages.filter(item => packagesUpdate.some(update => item.name === update.name)));
        break;
      case 'prerelease':
        setFilteredPackages(
          packages.filter(item =>
            packagesUpdate.some(
              update => item.name === update.name && getUpdateType(item.version, update.version) === 'prerelease',
            ),
          ),
        );
        break;
      case 'major':
        setFilteredPackages(
          packages.filter(item =>
            packagesUpdate.some(
              update => item.name === update.name && getUpdateType(item.version, update.version) === 'major',
            ),
          ),
        );
        break;
      case 'minor':
        setFilteredPackages(
          packages.filter(item =>
            packagesUpdate.some(
              update => item.name === update.name && getUpdateType(item.version, update.version) === 'minor',
            ),
          ),
        );
        break;
      case 'patch':
        setFilteredPackages(
          packages.filter(item =>
            packagesUpdate.some(
              update => item.name === update.name && getUpdateType(item.version, update.version) === 'patch',
            ),
          ),
        );
        break;
      case 'others':
        setFilteredPackages(
          packages.filter(item =>
            packagesUpdate.some(
              update => item.name === update.name && getUpdateType(item.version, update.version) === null,
            ),
          ),
        );
        break;
    }
  }, [selectedFilter, packagesUpdate, packages]);

  useEffect(() => {
    if (isEmpty(pythonPath)) setIsValidPython(false);
  }, [pythonPath]);

  useEffect(() => {
    setSearchData(filteredPackages.filter(item => searchInStrings(searchValue, [item.name])));
  }, [searchValue, filteredPackages]);

  const closePackageManager = () => {
    setIsOpen(false);
  };

  const checkForUpdates = (type: 'req' | 'normal') => {
    setIsLoadingUpdates(true);

    const updateData = (result: SitePackages_Info[]) => {
      setPackagesUpdate(result);
      setPackages(prevState =>
        prevState.map(item => {
          const updateVersion = result.find(update => update.name === item.name)?.version;
          return updateVersion ? {...item, updateVersion} : item;
        }),
      );
    };

    if (type === 'req') {
      pIpc
        .getReqPath(id)
        .then(reqPath => {
          if (reqPath) {
            pIpc
              .getUpdatesReq(pythonPath, reqPath, packages)
              .then(updateData)
              .finally(() => {
                setIsLoadingUpdates(false);
              });
          }
        })
        .catch(err => {
          console.log(err);
          setIsLoadingUpdates(false);
        });
    } else {
      pIpc
        .getPackagesUpdateInfo(pythonPath)
        .then(updateData)
        .finally(() => {
          setIsLoadingUpdates(false);
        });
    }
  };

  const getPackageList = () => {
    setIsLoading(true);

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
          id={id}
          title={title}
          packages={packages}
          allUpdated={allUpdated}
          pythonPath={pythonPath}
          refresh={getPackageList}
          projectPath={projectPath}
          searchValue={searchValue}
          selectedKeys={selectedKeys}
          isValidPython={isValidPython}
          actionButtons={actionButtons}
          packagesUpdate={packagesUpdate}
          setSearchValue={setSearchValue}
          checkForUpdates={checkForUpdates}
          setSelectedFilter={setSelectedFilter}
          checkingUpdates={!isLoading && isLoadingUpdates}
        />
        <PackageManagerBody
          items={items}
          removed={removed}
          updated={updated}
          isLoading={isLoading}
          locateVenv={locateVenv}
          isLocating={isLocating}
          pythonPath={pythonPath}
          selectedKeys={selectedKeys}
          isValidPython={isValidPython}
          packagesUpdate={packagesUpdate}
          setSelectedKeys={setSelectedKeys}
        />
        <ModalFooter className="bg-foreground-200 dark:bg-LynxRaisinBlack flex flex-col space-y-2">
          <Footer_TablePage setItems={setItems} searchData={searchData} />
          <Button size="sm" color="warning" variant="faded" onPress={closePackageManager} fullWidth>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
