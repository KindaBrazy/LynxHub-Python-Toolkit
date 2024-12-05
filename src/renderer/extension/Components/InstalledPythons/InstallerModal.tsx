import {
  Button,
  CircularProgress,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Progress,
} from '@nextui-org/react';
import {List, Tooltip} from 'antd';
import {isEmpty} from 'lodash';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {useEffect, useState} from 'react';

import {PythonVersion} from '../../../../cross/CrossExtensions';
import {formatSize} from '../../../../cross/CrossUtils';
import {useAppState} from '../../../src/App/Redux/App/AppReducer';
import {getIconByName} from '../../../src/assets/icons/SvgIconsContainer';

type Props = {
  isOpen: boolean;
  closeModal: () => void;
  refresh: () => void;
  installed: string[];
};

export default function InstallerModal({isOpen, closeModal, refresh, installed}: Props) {
  const [versions, setVersions] = useState<PythonVersion[]>([]);
  const [searchVersions, setSearchVersions] = useState<PythonVersion[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(false);

  const isDarkMode = useAppState('darkMode');

  const fetchPythonList = () => {
    setLoadingList(true);
    window.electron.ipcRenderer.invoke('get-available-pythons').then((result: PythonVersion[]) => {
      setVersions(result.filter(item => !installed.includes(item.version)));
      setLoadingList(false);
    });
  };

  useEffect(() => {
    if (isOpen && isEmpty(versions)) fetchPythonList();
  }, [isOpen, versions]);

  const [inputValue, setInputValue] = useState<string>('');

  useEffect(() => {
    if (isEmpty(inputValue)) {
      setSearchVersions(versions);
    } else {
      setSearchVersions(versions.filter(version => version.version.startsWith(inputValue)));
    }
  }, [inputValue, versions]);

  const [installingVersion, setInstallingVersion] = useState<PythonVersion | undefined>(undefined);
  const [downloadProgress, setDownloadProgress] = useState<
    | {
        percentage: number;
        downloaded: number;
        total: number;
      }
    | undefined
  >(undefined);
  const [installStage, setInstallStage] = useState<'installing' | 'downloading'>();

  const installPython = (version: PythonVersion) => {
    setInstallingVersion(version);

    window.electron.ipcRenderer.removeAllListeners('download-python-progress');
    window.electron.ipcRenderer.on('download-python-progress', (_e, stage, progress: typeof downloadProgress) => {
      setInstallStage(stage);
      if (stage === 'downloading') {
        setDownloadProgress(progress);
      }
    });

    window.electron.ipcRenderer
      .invoke('install-python', version)
      .then(() => {
        refresh();
        closeModal();
        console.log('installed', version);
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        setInstallingVersion(undefined);
      });
  };

  return (
    <>
      <Modal
        size="xl"
        isOpen={isOpen}
        onClose={closeModal}
        isDismissable={false}
        scrollBehavior="inside"
        classNames={{backdrop: '!top-10', wrapper: '!top-10 pb-8'}}
        hideCloseButton>
        <ModalContent className="overflow-hidden">
          <ModalHeader className="bg-foreground-100 justify-center">Python Installer</ModalHeader>
          <ModalBody className="pt-4 pb-0 px-0">
            {isEmpty(installingVersion) && (
              <div className="flex flex-row gap-x-2 px-4">
                <Input
                  size="sm"
                  type="search"
                  value={inputValue}
                  onValueChange={setInputValue}
                  startContent={getIconByName('Circle')}
                  placeholder="Search for python version..."
                />
                <Tooltip title="Refresh list">
                  <Button
                    size="sm"
                    variant="flat"
                    onPress={fetchPythonList}
                    startContent={getIconByName('Refresh')}
                    isIconOnly
                  />
                </Tooltip>
              </div>
            )}
            <OverlayScrollbarsComponent
              options={{
                overflow: {x: 'hidden', y: 'scroll'},
                scrollbars: {
                  autoHide: 'move',
                  clickScroll: true,
                  theme: isDarkMode ? 'os-theme-light' : 'os-theme-dark',
                },
              }}
              className={`pr-3 mr-1 pl-4 pb-4`}>
              {!isEmpty(installingVersion) ? (
                installStage === 'installing' ? (
                  <Progress
                    className="my-4 px-2"
                    label={`Installing Python v${installingVersion?.version}, Please wait...`}
                    isIndeterminate
                  />
                ) : (
                  <Progress
                    className="my-4 px-2"
                    value={(downloadProgress?.percentage || 0.1) * 100}
                    classNames={{label: '!text-small', value: '!text-small'}}
                    label={`Downloading ${installingVersion?.url.split('/').pop()}, Please wait...`}
                    valueLabel={`${formatSize(downloadProgress?.downloaded)} of ${formatSize(downloadProgress?.total)}`}
                    showValueLabel
                  />
                )
              ) : loadingList ? (
                <CircularProgress
                  size="lg"
                  className="justify-self-center my-4"
                  label="Loading available pythons..."
                  classNames={{indicator: 'stroke-[#ffe66e]'}}
                />
              ) : (
                <List
                  renderItem={item => (
                    <List.Item
                      actions={[
                        <Button size="sm" variant="faded" key={'install_python'} onPress={() => installPython(item)}>
                          Install
                        </Button>,
                      ]}
                      className="hover:bg-foreground-100 transition-colors duration-150">
                      <Link size="sm" href={item.url} color="foreground" isExternal showAnchorIcon>
                        {item.version}
                      </Link>
                    </List.Item>
                  )}
                  className="overflow-hidden"
                  dataSource={searchVersions}
                  bordered
                />
              )}
            </OverlayScrollbarsComponent>
          </ModalBody>
          <ModalFooter className="bg-foreground-100">
            <Button
              size="sm"
              color="warning"
              variant="faded"
              onPress={closeModal}
              disabled={!isEmpty(installingVersion)}
              fullWidth>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
