import {Button, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tab, Tabs} from '@nextui-org/react';
import {Dispatch, Key, SetStateAction, useState} from 'react';

import {PythonInstallation} from '../../../../cross/extension/CrossExtTypes';
import {modalMotionProps} from '../../../src/App/Utils/Constants';
import InstalledPythons from './InstalledPythons/InstalledPythons';
import Venv from './VirtualEnvironments/Venv';

type ModalProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export default function PythonToolkitModal({isOpen, setIsOpen}: ModalProps) {
  const [installedPythons, setInstalledPythons] = useState<PythonInstallation[]>([]);
  const [isLoadingPythons, setIsLoadingPythons] = useState<boolean>(false);

  const [currentTab, setCurrentTab] = useState<Key>('installation');
  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      backdrop="blur"
      onClose={onClose}
      isDismissable={false}
      scrollBehavior="inside"
      className="max-w-[90%]"
      motionProps={modalMotionProps}
      classNames={{backdrop: '!top-10', wrapper: '!top-10 pb-8'}}
      hideCloseButton>
      <ModalContent className="overflow-hidden">
        <ModalHeader className="bg-foreground-100">
          <Tabs
            color="primary"
            onSelectionChange={setCurrentTab}
            selectedKey={currentTab.toString()}
            classNames={{tabList: 'bg-foreground-200'}}
            fullWidth>
            <Tab key="installation" title="Installations" />
            <Tab key="venv" title="Virtual Environments" />
          </Tabs>
        </ModalHeader>
        <Divider />
        <ModalBody className="scrollbar-hide my-4">
          <InstalledPythons
            installedPythons={installedPythons}
            isLoadingPythons={isLoadingPythons}
            visible={currentTab === 'installation'}
            setIsLoadingPythons={setIsLoadingPythons}
            setInstalledPythons={setInstalledPythons}
          />
          <Venv
            visible={currentTab === 'venv'}
            installedPythons={installedPythons}
            isLoadingPythons={isLoadingPythons}
          />
        </ModalBody>
        <Divider />
        <ModalFooter className="bg-foreground-100">
          <Button size="sm" variant="flat" color="warning" onPress={onClose} fullWidth>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
