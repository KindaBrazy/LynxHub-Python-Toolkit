import {Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tab, Tabs} from '@nextui-org/react';
import {Key, useMemo, useState} from 'react';

import {modalMotionProps} from '../../../../../src/App/Utils/Constants';
import InstallerConda from './Installer_Conda';
import InstallerOfficial from './Installer_Official';

type Props = {
  isOpen: boolean;
  closeModal: () => void;
  refresh: () => void;
  installed: {
    version: string;
    installationType: 'official' | 'conda' | 'other';
  }[];
};

export default function InstallerModal({isOpen, closeModal, refresh, installed}: Props) {
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
        onClose={closeModal}
        isDismissable={false}
        scrollBehavior="inside"
        motionProps={modalMotionProps}
        classNames={{backdrop: '!top-10', wrapper: '!top-10 pb-8'}}
        hideCloseButton>
        <ModalContent className="overflow-hidden">
          <ModalHeader className="bg-foreground-100 justify-center items-center flex-col gap-y-2">
            <span>Python Installer</span>
            <Tabs
              variant="underlined"
              onSelectionChange={setCurrentTab}
              selectedKey={currentTab.toString()}
              classNames={{cursor: '!bg-[#ffe66e]'}}>
              <Tab key="official" title="Official" />
              <Tab key="conda" title="Conda" />
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
          <ModalFooter className="bg-foreground-100">
            <Button size="sm" color="warning" variant="faded" onPress={closeModal} isDisabled={closeDisabled} fullWidth>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
