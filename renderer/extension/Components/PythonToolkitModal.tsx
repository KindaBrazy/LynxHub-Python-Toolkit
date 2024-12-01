import {Button, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tab, Tabs} from '@nextui-org/react';
import {Dispatch, Key, SetStateAction, useState} from 'react';

import {modalMotionProps} from '../../src/App/Utils/Constants';
import InstalledPythons from './InstalledPythons';
import PythonPackageManager from './PythonPackageManager';
import VenvPython from './VenvPython';

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
      className="max-w-[90%]"
      scrollBehavior="inside"
      motionProps={modalMotionProps}
      classNames={{backdrop: '!top-10', closeButton: 'cursor-default', wrapper: '!top-10'}}
      hideCloseButton>
      <ModalContent>
        <ModalHeader>
          <Tabs color="primary" onSelectionChange={setCurrentTab} selectedKey={currentTab.toString()} fullWidth>
            <Tab key="installation" title="Installations" />
            <Tab key="venv" title="Virtual Environments" />
            <Tab key="packages" title="Package Manager" />
          </Tabs>
        </ModalHeader>
        <Divider />
        <ModalBody className="scrollbar-hide my-4">
          <>
            {currentTab === 'installation' && <InstalledPythons />}
            {currentTab === 'venv' && <VenvPython />}
            {currentTab === 'packages' && <PythonPackageManager />}
          </>
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
