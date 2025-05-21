import {Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tab, Tabs} from '@heroui/react';
import {Key, useMemo, useState} from 'react';

import {modalMotionProps} from '../../../../../../../src/renderer/src/App/Utils/Constants';
import InstallerConda from './CondaInstaller';
import InstallerOfficial from './OfficialInstaller';

type Props = {
  isOpen: boolean;
  closeModal: () => void;
  refresh: (research: boolean) => void;
  installed: {
    version: string;
    installationType: 'official' | 'conda' | 'other';
  }[];
  show: string;
};

export default function InstallerModal({isOpen, closeModal, refresh, installed, show}: Props) {
  const [closeDisabled, setCloseDisabled] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<Key>('official');

  const installedOfficial = useMemo(
    () => installed.filter(item => item.installationType !== 'conda').map(item => item.version),
    [installed],
  );
  const installedConda = useMemo(
    () => installed.filter(item => item.installationType === 'conda').map(item => item.version),
    [installed],
  );

  return (
    <>
      <Modal
        size="xl"
        isOpen={isOpen}
        placement="center"
        onClose={closeModal}
        isDismissable={false}
        scrollBehavior="inside"
        motionProps={modalMotionProps}
        classNames={{backdrop: `!top-10 ${show}`, wrapper: `!top-10 pb-8 ${show}`}}
        hideCloseButton>
        <ModalContent className="overflow-hidden">
          <ModalHeader className="bg-foreground-100 justify-center items-center flex-col gap-y-2">
            <span>Install a New Python Version</span>
            <Tabs
              variant="light"
              onSelectionChange={setCurrentTab}
              selectedKey={currentTab.toString()}
              disableAnimation>
              <Tab key="official" title="Official Python Releases" />
              <Tab key="conda" title="Conda Environments" />
            </Tabs>
          </ModalHeader>
          <ModalBody className="pt-4 pb-0 px-0 scrollbar-hide">
            {currentTab === 'official' && (
              <InstallerOfficial
                isOpen={isOpen}
                refresh={refresh}
                closeModal={closeModal}
                installed={installedOfficial}
                setCloseDisabled={setCloseDisabled}
              />
            )}
            {currentTab === 'conda' && (
              <InstallerConda
                isOpen={isOpen}
                refresh={refresh}
                closeModal={closeModal}
                installed={installedConda}
                setCloseDisabled={setCloseDisabled}
              />
            )}
          </ModalBody>
          <ModalFooter className="py-3">
            <Button
              variant="light"
              color="warning"
              onPress={closeModal}
              className="cursor-default"
              isDisabled={closeDisabled}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
