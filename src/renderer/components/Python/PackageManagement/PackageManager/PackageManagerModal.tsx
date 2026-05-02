import {Modal, Selection, UseOverlayStateReturn} from '@heroui-v3/react';
import TabModal from '@lynx/components/TabModal';
import {isEmpty} from 'lodash-es';
import {Dispatch, ReactNode, SetStateAction, useEffect, useState} from 'react';

import {searchInStrings} from '../../../../../../../src/renderer/mainWindow/utils';
import {FilterKeys, PackageInfo, PackageUpdate, SitePackages_Info} from '../../../../../cross/CrossExtTypes';
import {getUpdateType} from '../../../../../cross/CrossExtUtils';
import pIpc from '../../../../PIpc';
import PackageManagerBody from './Body/Body';
import Footer_Close from './Footer/CloseBtn';
import TablePage from './Footer/TablePage';
import PackageManagerHeader from './Header/Header';
import UpdateModal from './Update-Modal';

type Props = {
  state: UseOverlayStateReturn;
  pythonPath: string;

  title?: string;
  actionButtons?: ReactNode[];

  id: string;
  projectPath?: string;
  setPythonPath?: Dispatch<SetStateAction<string>>;
  onPackagesChanged?: () => void;
};

export default function PackageManagerModal({
  title = 'Package Manager',
  actionButtons,
  state,
  pythonPath,
  id,
  projectPath,
  setPythonPath,
  onPackagesChanged,
}: Props) {
  const [isLoadingPackages, setIsLoadingPackages] = useState<boolean>(false);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [packagesChanged, setPackagesChanged] = useState<boolean>(false);

  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<PackageInfo[]>([]);
  const [packagesUpdate, setPackagesUpdate] = useState<SitePackages_Info[]>([]);

  const [searchValue, setSearchValue] = useState<string>('');
  const [searchData, setSearchData] = useState<PackageInfo[]>([]);

  const [isValidPython, setIsValidPython] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<FilterKeys>('all');

  const [items, setItems] = useState<PackageInfo[]>(searchData);
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));

  const [isUpdateTerminalOpen, setIsUpdateTerminalOpen] = useState<boolean>(false);

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
    state.close();
    setPackagesUpdate([]);
    if (packagesChanged && onPackagesChanged) {
      onPackagesChanged();
      setPackagesChanged(false);
    }
  };

  const checkForUpdates = (type: 'req' | 'normal') => {
    setIsCheckingUpdates(true);

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
              .getUpdatesReq(reqPath, packages)
              .then(updateData)
              .finally(() => {
                setIsCheckingUpdates(false);
              });
          }
        })
        .catch(err => {
          console.log(err);
          setIsCheckingUpdates(false);
        });
    } else {
      pIpc
        .getPackagesUpdateInfo(packages)
        .then(updateData)
        .finally(() => {
          setIsCheckingUpdates(false);
        });
    }
  };

  const getPackageList = () => {
    setIsLoadingPackages(true);

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
        setIsLoadingPackages(false);
      });
  };

  useEffect(() => {
    if (state.isOpen && !isEmpty(pythonPath)) {
      getPackageList();
    } else {
      setSearchData([]);
      setPackages([]);
      pIpc.getExePathAssociate(id).then(result => {
        if (result && setPythonPath) setPythonPath(result);
      });
    }
  }, [pythonPath, state.isOpen]);

  const updated = (updates: PackageUpdate | PackageUpdate[]) => {
    const updatesArray = Array.isArray(updates) ? updates : [updates];

    if (updatesArray.length === 0) {
      return;
    }

    setPackagesChanged(true);
    const updatesMap = new Map(updatesArray.map(item => [item.name, item.targetVersion]));

    setPackagesUpdate(prevUpdates => prevUpdates.filter(item => !updatesMap.has(item.name)));

    setPackages(prevPackages =>
      prevPackages.map(pkg => {
        if (updatesMap.has(pkg.name)) {
          return {
            ...pkg,
            version: updatesMap.get(pkg.name)!,
            updateVersion: undefined,
          };
        }

        return pkg;
      }),
    );

    setSelectedKeys(new Set([]));
  };

  const removed = (name: string) => {
    setPackagesChanged(true);
    setPackagesUpdate(prevState => prevState.filter(item => item.name !== name));
    setPackages(prevState => prevState.filter(item => item.name !== name));
  };

  const refreshAfterInstall = () => {
    setPackagesChanged(true);
    getPackageList();
  };

  return (
    <>
      <TabModal isOpen={state.isOpen} onOpenChange={state.setOpen}>
        <Modal.CloseTrigger />
        <Modal.Header className="gap-y-2">
          <PackageManagerHeader
            id={id}
            title={title}
            updated={updated}
            packages={packages}
            visibleItems={items}
            isUpdating={isUpdating}
            pythonPath={pythonPath}
            projectPath={projectPath}
            searchValue={searchValue}
            selectedKeys={selectedKeys}
            refresh={refreshAfterInstall}
            setIsUpdating={setIsUpdating}
            isValidPython={isValidPython}
            actionButtons={actionButtons}
            selectedFilter={selectedFilter}
            packagesUpdate={packagesUpdate}
            setSearchValue={setSearchValue}
            checkForUpdates={checkForUpdates}
            setSelectedFilter={setSelectedFilter}
            setIsUpdateTerminalOpen={setIsUpdateTerminalOpen}
            checkingUpdates={!isLoadingPackages && isCheckingUpdates}
          />
        </Modal.Header>
        <PackageManagerBody
          id={id}
          items={items}
          removed={removed}
          updated={updated}
          pythonPath={pythonPath}
          selectedKeys={selectedKeys}
          isLoading={isLoadingPackages}
          setPythonPath={setPythonPath}
          isValidPython={isValidPython}
          packagesUpdate={packagesUpdate}
          setSelectedKeys={setSelectedKeys}
          setIsUpdateTerminalOpen={setIsUpdateTerminalOpen}
        />
        <Modal.Footer className="items-center py-3">
          <TablePage setItems={setItems} searchData={searchData} />
          <Footer_Close
            isUpdating={isUpdating}
            isCheckingUpdates={isCheckingUpdates}
            closePackageManager={closePackageManager}
          />
        </Modal.Footer>
      </TabModal>
      <UpdateModal isOpen={isUpdateTerminalOpen} setIsOpen={setIsUpdateTerminalOpen} />
    </>
  );
}
