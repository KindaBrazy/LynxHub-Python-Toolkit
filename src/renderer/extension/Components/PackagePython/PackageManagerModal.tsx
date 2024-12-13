import {
  Alert,
  Button,
  CircularProgress,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
} from '@nextui-org/react';
import {Empty, List} from 'antd';
import {isEmpty} from 'lodash';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';

import {pythonChannels, SitePackages_Info} from '../../../../cross/CrossExtensions';
import {useAppState} from '../../../src/App/Redux/App/AppReducer';
import {modalMotionProps} from '../../../src/App/Utils/Constants';
import {searchInStrings} from '../../../src/App/Utils/UtilFunctions';
import {Add_Icon, Circle_Icon, Download_Icon, Download2_Icon} from '../../../src/assets/icons/SvgIcons/SvgIcons1';
import {Trash_Icon} from '../../../src/assets/icons/SvgIcons/SvgIcons3';
import {Warn_Icon} from '../SvgIcons';

const WARNING_KEY = 'python-package-warning';

type Props = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  pythonPath: string;
};

type PackageInfo = SitePackages_Info & {
  updateVersion?: string;
};

export default function PackageManagerModal({isOpen, setIsOpen, pythonPath}: Props) {
  const [showWarning, setShowWarning] = useState<boolean>(true);
  const isDarkMode = useAppState('darkMode');

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
    setShowWarning(localStorage.getItem(WARNING_KEY) !== 'false');
  }, []);

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

      console.log('useEffect');

      window.electron.ipcRenderer
        .invoke(pythonChannels.getPackagesInfo, pythonPath)
        .then(setPackages)
        .catch(console.log)
        .finally(() => {
          console.log('useEffect 2');
          setIsLoading(false);
        });
    }
  }, [pythonPath, isOpen]);

  const onWarningClose = () => {
    setShowWarning(false);
    localStorage.setItem(WARNING_KEY, 'false');
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
        <ModalHeader className="bg-foreground-200 dark:bg-LynxRaisinBlack items-center flex-col gap-y-2">
          <div className="flex flex-row justify-between w-full">
            <span>Package Manager ({packages.length})</span>
            <div className="gap-x-2 flex items-center">
              {!isEmpty(packagesUpdate) && (
                <Button size="sm" radius="sm" variant="flat" color="success" startContent={<Download2_Icon />}>
                  Update All ({packagesUpdate.length})
                </Button>
              )}
              {!isLoading && isLoadingUpdates && (
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
        <ModalBody
          options={{
            overflow: {x: 'hidden', y: 'scroll'},
            scrollbars: {
              autoHide: 'move',
              clickScroll: true,
              theme: isDarkMode ? 'os-theme-light' : 'os-theme-dark',
            },
          }}
          className="size-full p-4"
          as={OverlayScrollbarsComponent}>
          <div className="w-full flex flex-col gap-y-4">
            <div className="flex flex-row gap-8 flex-wrap justify-center">
              {isLoading ? (
                <CircularProgress
                  size="lg"
                  className="mb-4"
                  classNames={{indicator: 'stroke-[#ffe66e]'}}
                  label="Loading packages data, please wait..."
                />
              ) : (
                <List
                  locale={{
                    emptyText: <Empty description="No packages found." image={Empty.PRESENTED_IMAGE_SIMPLE} />,
                  }}
                  renderItem={item => {
                    const actions = [
                      <Button
                        color="danger"
                        key="uninstall"
                        variant="light"
                        startContent={<Trash_Icon />}
                        isIconOnly
                      />,
                    ];
                    if (item.updateVersion)
                      actions.unshift(
                        <Button
                          key="update"
                          variant="light"
                          color="success"
                          startContent={<Download_Icon />}
                          isIconOnly
                        />,
                      );
                    return (
                      <List.Item
                        actions={actions}
                        className="hover:bg-foreground-100 transition-colors duration-150 !pr-1">
                        <List.Item.Meta
                          description={
                            <div className="flex flex-row items-center gap-x-1">
                              <span>{item.version}</span>
                              {item.updateVersion && <span>({item.updateVersion})</span>}
                            </div>
                          }
                          title={
                            <div className="flex flex-row items-center gap-x-1">
                              <span>{item.name}</span>
                              {item.updateVersion && <Warn_Icon className="text-warning size-[1.1rem]" />}
                            </div>
                          }
                        />
                      </List.Item>
                    );
                  }}
                  dataSource={searchData}
                  className="w-full overflow-hidden"
                  bordered
                />
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="bg-foreground-200 dark:bg-LynxRaisinBlack">
          <Button size="sm" color="warning" variant="faded" onPress={closePackageManager} fullWidth>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
