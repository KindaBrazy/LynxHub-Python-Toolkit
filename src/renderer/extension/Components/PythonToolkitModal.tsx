import {Button, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tab, Tabs} from '@nextui-org/react';
import {Dispatch, Key, SetStateAction, useState} from 'react';

import {PythonInstallation} from '../../../cross/CrossExtensions';
import {modalMotionProps} from '../../src/App/Utils/Constants';
import InstalledPythons from './InstalledPythons/InstalledPythons';
import VenvPython from './VenvPython/VenvPython';

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
        <ModalHeader>
          <Tabs color="primary" onSelectionChange={setCurrentTab} selectedKey={currentTab.toString()} fullWidth>
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
          <VenvPython
            visible={currentTab === 'venv'}
            installedPythons={installedPythons}
            isLoadingPythons={isLoadingPythons}
          />
        </ModalBody>
        <Divider />
        <ModalFooter>
          <Button color="warning" variant="faded" onPress={onClose} fullWidth>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
