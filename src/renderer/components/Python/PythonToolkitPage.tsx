import {Key, Tabs} from '@heroui/react';
import {useState} from 'react';

import {PythonInstallation} from '../../../cross/CrossExtTypes';
import InstalledPythons from './InstalledPythons/InstalledPythons';
import Venv from './VirtualEnvironments/Venv';

export default function PythonToolkitPage() {
  const [installedPythons, setInstalledPythons] = useState<PythonInstallation[]>([]);
  const [isLoadingPythons, setIsLoadingPythons] = useState<boolean>(false);

  const [currentTab, setCurrentTab] = useState<Key>('installation');

  return (
    <div className="flex flex-col h-full w-full">
      <div className="pt-5 pb-2 px-4">
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
      </div>
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <InstalledPythons
          installedPythons={installedPythons}
          isLoadingPythons={isLoadingPythons}
          visible={currentTab === 'installation'}
          setIsLoadingPythons={setIsLoadingPythons}
          setInstalledPythons={setInstalledPythons}
        />
        <Venv visible={currentTab === 'venv'} installedPythons={installedPythons} isLoadingPythons={isLoadingPythons} />
      </div>
    </div>
  );
}
