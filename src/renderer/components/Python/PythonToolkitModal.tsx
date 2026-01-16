import {Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tab, Tabs} from '@heroui/react';
import {Dispatch, Key, SetStateAction, useState} from 'react';

import {modalMotionProps} from '../../../../../src/renderer/main_window/utils/constants';
import {PythonInstallation} from '../../../cross/CrossExtTypes';
import InstalledPythons from './InstalledPythons/InstalledPythons';
import Venv from './VirtualEnvironments/Venv';

type ModalProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  show: string;
};

export default function PythonToolkitModal({isOpen, setIsOpen, show}: ModalProps) {
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
      placement="center"
      isDismissable={false}
      scrollBehavior="inside"
      className="max-w-[90%]"
      motionProps={modalMotionProps}
      classNames={{backdrop: `!top-10 ${show}`, wrapper: `!top-10 pb-8 ${show}`}}
      hideCloseButton>
      <ModalContent className="overflow-hidden">
        <ModalHeader className="bg-foreground-100 shadow-sm">
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
        <ModalBody className="scrollbar-hide mb-0">
          <InstalledPythons
            show={show}
            installedPythons={installedPythons}
            isLoadingPythons={isLoadingPythons}
            visible={currentTab === 'installation'}
            setIsLoadingPythons={setIsLoadingPythons}
            setInstalledPythons={setInstalledPythons}
          />
          <Venv
            show={show}
            visible={currentTab === 'venv'}
            installedPythons={installedPythons}
            isLoadingPythons={isLoadingPythons}
          />
        </ModalBody>
        <ModalFooter className="py-3">
          <Button variant="light" color="warning" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
