import {Alert, Button, Modal, useOverlayState} from '@heroui-v3/react';
import TabModal from '@lynx/components/TabModal';
import {topToast} from '@lynx/layouts/ToastProviders';
import {Download} from '@solar-icons/react-perf/BoldDuotone';
import {Plus} from 'lucide-react';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {useState} from 'react';

import {useAppState} from '../../../../../../../../src/renderer/mainWindow/redux/reducers/app';
import pIpc from '../../../../../PIpc';
import Installer from './Installer';

type Props = {
  pythonPath: string;
  refresh: () => void;
};

export default function InstallerModal({refresh, pythonPath}: Props) {
  const [installing, setInstalling] = useState<boolean>(false);
  const [installCommand, setInstallCommand] = useState<string>('');
  const [isInstallDisabled, setIsInstallDisabled] = useState<boolean>(true);

  const isDarkMode = useAppState('darkMode');

  const state = useOverlayState();

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
      <Button size="sm" variant="tertiary" onPress={state.open}>
        <Plus size={12} />
        Install Package
      </Button>
      <TabModal size="lg" isOpen={state.isOpen} onOpenChange={state.setOpen} dialogClassName="px-4 max-w-2xl">
        <Modal.CloseTrigger />
        <Modal.Header>
          <Modal.Heading className="px-2">Python Package Installer</Modal.Heading>
        </Modal.Header>
        <Modal.Body className="scrollbar-hide px-0 pt-0">
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
        </Modal.Body>
        <Modal.Footer className="flex-col">
          {installing && (
            <Alert status="warning" className="bg-surface-secondary">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>
                  Installing packages... This may take several minutes depending on the number and size of the packages
                  you selected.
                </Alert.Title>
              </Alert.Content>
            </Alert>
          )}
          <Button size="md" isPending={installing} onPress={handleInstall} isDisabled={isInstallDisabled} fullWidth>
            <Download />
            {installing ? 'Installing...' : 'Install Packages'}
          </Button>
        </Modal.Footer>
      </TabModal>
    </>
  );
}
