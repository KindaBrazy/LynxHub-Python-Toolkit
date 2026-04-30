import {Key, Modal, Tabs} from '@heroui-v3/react';
import {UseOverlayStateReturn} from '@heroui-v3/react';
import LynxScroll from '@lynx/components/LynxScroll';
import TabModal from '@lynx/components/TabModal';
import {useMemo, useState} from 'react';

import InstallerConda from './CondaInstaller';
import InstallerOfficial from './OfficialInstaller';

type Props = {
  state: UseOverlayStateReturn;
  refresh: (research: boolean) => void;
  installed: {
    version: string;
    installationType: 'official' | 'conda' | 'other';
  }[];
};

export default function InstallerModal({state, refresh, installed}: Props) {
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
    <TabModal size="lg" isOpen={state.isOpen} dialogClassName="px-0" onOpenChange={state.setOpen}>
      <Modal.CloseTrigger isDisabled={closeDisabled} />
      <Modal.Header className="px-4">
        <Modal.Heading>Install a New Python Version</Modal.Heading>
        <Tabs className="w-full" selectedKey={currentTab} onSelectionChange={setCurrentTab}>
          <Tabs.ListContainer>
            <Tabs.List>
              <Tabs.Tab id="official">
                Official Python Releases
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="conda">
                Conda Environments
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>
      </Modal.Header>
      <Modal.Body className="overflow-hidden">
        <LynxScroll className="size-full">
          {currentTab === 'official' && (
            <InstallerOfficial
              state={state}
              refresh={refresh}
              installed={installedOfficial}
              setCloseDisabled={setCloseDisabled}
            />
          )}
          {currentTab === 'conda' && (
            <InstallerConda
              state={state}
              refresh={refresh}
              installed={installedConda}
              setCloseDisabled={setCloseDisabled}
            />
          )}
        </LynxScroll>
      </Modal.Body>
    </TabModal>
  );
}
