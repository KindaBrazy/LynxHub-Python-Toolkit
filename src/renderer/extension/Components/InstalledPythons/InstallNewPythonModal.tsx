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
import {List} from 'antd';
import {isEmpty} from 'lodash';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {useEffect, useState} from 'react';

import {PythonVersion} from '../../../../cross/CrossExtensions';
import {useAppState} from '../../../src/App/Redux/App/AppReducer';
import {getIconByName} from '../../../src/assets/icons/SvgIconsContainer';

type Props = {
  isOpen: boolean;
  closeModal: () => void;
};

export default function InstallNewPythonModal({isOpen, closeModal}: Props) {
  const [versions, setVersions] = useState<PythonVersion[]>([]);
  const [searchVersions, setSearchVersions] = useState<PythonVersion[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(false);

  const isDarkMode = useAppState('darkMode');

  useEffect(() => {
    if (isOpen && isEmpty(versions)) {
      setLoadingList(true);
      window.electron.ipcRenderer.invoke('get-available-pythons').then((result: PythonVersion[]) => {
        setVersions(result);
        setLoadingList(false);
      });
    }
  }, [isOpen, versions]);

  const [inputValue, setInputValue] = useState<string>('');

  useEffect(() => {
    if (isEmpty(inputValue)) {
      setSearchVersions(versions);
    } else {
      setSearchVersions(versions.filter(version => version.version.startsWith(inputValue)));
    }
  }, [inputValue, versions]);

  const [installingVersion, setInstallingVersion] = useState<string>('');

  const installPython = (version: PythonVersion) => {
    setInstallingVersion(version.version);

    window.electron.ipcRenderer
      .invoke('install-python', version)
      .then(() => {
        console.log('installed', version);
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        setInstallingVersion('');
      });
  };

  return (
    <>
      <Modal
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
              <Input
                size="sm"
                type="search"
                className="px-4"
                value={inputValue}
                onValueChange={setInputValue}
                startContent={getIconByName('Circle')}
                placeholder="Search for python version..."
              />
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
                <Progress
                  className="my-4 px-2"
                  label={`Installing Python v${installingVersion}, Please wait...`}
                  isIndeterminate
                />
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
            <Button size="sm" color="danger" variant="faded" onPress={closeModal} fullWidth>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
