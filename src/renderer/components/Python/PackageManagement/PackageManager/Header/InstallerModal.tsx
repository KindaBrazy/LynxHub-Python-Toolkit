import {Alert, Button, Modal, useOverlayState} from '@heroui/react';
import LynxScroll from '@lynx/components/LynxScroll';
import TabModal from '@lynx/components/TabModal';
import {topToast} from '@lynx/layouts/ToastProviders';
import {Download} from '@solar-icons/react-perf/BoldDuotone';
import {Plus} from 'lucide-react';
import {useEffect, useState} from 'react';

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
  const [packageCount, setPackageCount] = useState<number>(0);
  const [requirementsFileCount, setRequirementsFileCount] = useState<number>(0);

  const state = useOverlayState();

  useEffect(() => {
    if (!state.isOpen) {
      setInstallCommand('');
      setPackageCount(0);
      setRequirementsFileCount(0);
    }
  }, [state.isOpen]);

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
        state.close();
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

  const isRequirementsInstall = installCommand.trim().includes('-r ');

  return (
    <>
      <Button size="sm" variant="tertiary" onPress={state.open}>
        <Plus size={12} />
        Package
      </Button>

      <TabModal size="lg" isOpen={state.isOpen} onOpenChange={state.setOpen} dialogClassName="px-4 max-w-5xl">
        <Modal.CloseTrigger />

        <Modal.Header className="flex items-center gap-3 px-5 pb-0">
          <Modal.Heading className="text-base font-semibold">Package Installer</Modal.Heading>
          {(packageCount > 0 || isRequirementsInstall) && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {isRequirementsInstall
                ? `${requirementsFileCount || 1} requirements file${requirementsFileCount !== 1 ? 's' : ''}`
                : `${packageCount} selected`}
            </span>
          )}
        </Modal.Header>

        <Modal.Body className="overflow-hidden px-0 pt-0">
          <LynxScroll className="size-full">
            <Installer
              isOpen={state.isOpen}
              setPackageCount={setPackageCount}
              setInstallCommand={setInstallCommand}
              setIsInstallDisabled={setIsInstallDisabled}
              setRequirementsFileCount={setRequirementsFileCount}
            />
          </LynxScroll>
        </Modal.Body>

        <Modal.Footer className="flex-col gap-y-2.5 px-5 pb-5">
          {installing && (
            <Alert status="warning" className="rounded-2xl bg-surface-secondary">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title className="text-sm">Installing packages… this may take a few minutes.</Alert.Title>
              </Alert.Content>
            </Alert>
          )}

          <div className="flex gap-2.5 w-full">
            <Button size="md" variant="tertiary" className="flex-none" onPress={state.close} isDisabled={installing}>
              Cancel
            </Button>
            <Button size="md" isPending={installing} onPress={handleInstall} isDisabled={isInstallDisabled} fullWidth>
              <Download />
              {installing
                ? 'Installing…'
                : isRequirementsInstall
                  ? 'Install Requirements'
                  : `Install${
                      packageCount > 0 ? ` ${packageCount} Package${packageCount !== 1 ? 's' : ''}` : ' Packages'
                    }`}
            </Button>
          </div>
        </Modal.Footer>
      </TabModal>
    </>
  );
}
