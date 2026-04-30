import {Alert, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@heroui/react';
import {topToast} from '@lynx/layouts/ToastProviders';
import {Download} from '@solar-icons/react-perf/BoldDuotone';
import {Plus} from 'lucide-react';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {useCallback, useState} from 'react';

import {useAppState} from '../../../../../../../../src/renderer/mainWindow/redux/reducers/app';
import pIpc from '../../../../../PIpc';
import Installer from './Installer';

type Props = {
  pythonPath: string;
  refresh: () => void;
  show: string;
};

export default function InstallerModal({refresh, pythonPath, show}: Props) {
  const [installing, setInstalling] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [installCommand, setInstallCommand] = useState<string>('');
  const [isInstallDisabled, setIsInstallDisabled] = useState<boolean>(true);

  const isDarkMode = useAppState('darkMode');

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleInstall = async () => {
    setInstalling(true);

    pIpc
      .installPackage(pythonPath, installCommand)
      .then(result => {
        if (result) {
          topToast.success('Packages installed successfully!');
        } else {
          topToast.danger('Failed to install packages. Please check your inputs and try again.');
        }
        close();
        refresh();
      })
      .catch(err => {
        topToast.danger('Failed to install packages. Please check your inputs and try again.');
        console.error(err);
      })
      .finally(() => {
        setInstalling(false);
      });
  };

  return (
    <>
      <Button size="sm" variant="solid" onPress={() => setIsOpen(true)} startContent={<Plus size={12} />}>
        Install Package
      </Button>
      <Modal
        size="2xl"
        isOpen={isOpen}
        onClose={close}
        placement="center"
        isDismissable={false}
        scrollBehavior="inside"
        classNames={{backdrop: `top-10! ${show}`, wrapper: `top-10! pb-8 ${show}`}}>
        <ModalContent>
          <ModalHeader className="pb-1 justify-center">Python Package Installer</ModalHeader>
          <ModalBody className="scrollbar-hide px-0 pt-0">
            <OverlayScrollbarsComponent
              options={{
                overflow: {x: 'hidden', y: 'scroll'},
                scrollbars: {
                  autoHide: 'move',
                  clickScroll: true,
                  theme: isDarkMode ? 'os-theme-light' : 'os-theme-dark',
                },
              }}>
              <Installer setInstallCommand={setInstallCommand} setIsInstallDisabled={setIsInstallDisabled} />
            </OverlayScrollbarsComponent>
          </ModalBody>
          <ModalFooter className="flex-col">
            {installing && (
              <Alert
                description={
                  'Installing packages... This may take several minutes depending on' +
                  ' the number and size of the packages you selected.'
                }
                color="warning"
                isClosable
              />
            )}
            <Button
              size="md"
              variant="flat"
              color="success"
              isLoading={installing}
              onPress={handleInstall}
              className="cursor-pointer"
              startContent={<Download />}
              isDisabled={isInstallDisabled}
              fullWidth>
              {installing ? 'Installing...' : 'Install Packages'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
