import {Key, Modal, Tabs, UseOverlayStateReturn} from '@heroui-v3/react';
import TabModal from '@lynx/components/TabModal';
import {useState} from 'react';

import {PythonInstallation} from '../../../cross/CrossExtTypes';
import InstalledPythons from './InstalledPythons/InstalledPythons';
import Venv from './VirtualEnvironments/Venv';

type Props = {
  state: UseOverlayStateReturn;
};

export default function PythonToolkitModal({state}: Props) {
  const [installedPythons, setInstalledPythons] = useState<PythonInstallation[]>([]);
  const [isLoadingPythons, setIsLoadingPythons] = useState<boolean>(false);

  const [currentTab, setCurrentTab] = useState<Key>('installation');

  return (
    <TabModal isOpen={state.isOpen} onOpenChange={state.setOpen}>
      <Modal.CloseTrigger />
      <Modal.Header className="pt-5 pb-2">
        <Tabs className="w-full" selectedKey={currentTab} onSelectionChange={setCurrentTab}>
          <Tabs.ListContainer>
            <Tabs.List aria-label="Options">
              <Tabs.Tab id="installation">
                Installations
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="venv">
                Virtual Environments
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>
      </Modal.Header>
      <Modal.Body className="scrollbar-hide">
        <InstalledPythons
          installedPythons={installedPythons}
          isLoadingPythons={isLoadingPythons}
          visible={currentTab === 'installation'}
          setIsLoadingPythons={setIsLoadingPythons}
          setInstalledPythons={setInstalledPythons}
        />
        <Venv visible={currentTab === 'venv'} installedPythons={installedPythons} isLoadingPythons={isLoadingPythons} />
      </Modal.Body>
    </TabModal>
  );
}
