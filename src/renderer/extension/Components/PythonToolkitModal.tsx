import {Button, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tab, Tabs} from '@nextui-org/react';
import {Dispatch, Key, SetStateAction, useState} from 'react';

import {modalMotionProps} from '../../src/App/Utils/Constants';
import InstalledPythons from './InstalledPythons/InstalledPythons';
import PythonPackageManager from './PackagePython/PythonPackageManager';
import VenvPython from './VenvPython/VenvPython';

type ModalProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export default function PythonToolkitModal({isOpen, setIsOpen}: ModalProps) {
  const [currentTab, setCurrentTab] = useState<Key>('installation');
  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
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
            <Tab key="packages" title="Package Manager" />
          </Tabs>
        </ModalHeader>
        <Divider />
        <ModalBody className="scrollbar-hide my-4">
          <InstalledPythons visible={currentTab === 'installation'} />
          <VenvPython visible={currentTab === 'venv'} />
          <PythonPackageManager visible={currentTab === 'packages'} />
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
