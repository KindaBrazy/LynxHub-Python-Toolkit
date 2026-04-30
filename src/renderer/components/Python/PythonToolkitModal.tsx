import {Tab, Tabs} from '@heroui/react';
import {Modal, UseOverlayStateReturn} from '@heroui-v3/react';
import TabModal from '@lynx/components/TabModal';
import {Key, useState} from 'react';

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
      <Modal.Header>
        <Modal.Heading className="bg-foreground-100 shadow-sm">
          <Tabs
            color="primary"
            onSelectionChange={setCurrentTab}
            selectedKey={currentTab.toString()}
            classNames={{tabList: 'bg-foreground-200'}}
            fullWidth>
            <Tab key="installation" title="Installations" />
            <Tab key="venv" title="Virtual Environments" />
          </Tabs>
        </Modal.Heading>
      </Modal.Header>
      <Modal.Body className="scrollbar-hide mb-0">
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
