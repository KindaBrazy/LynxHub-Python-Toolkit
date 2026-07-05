import {Key, ScrollShadow, Tabs} from '@heroui/react';
import CardsContainer from '@lynx/pages/CardsContainer';
import {useState} from 'react';

import {PythonInstallation} from '../../../cross/CrossExtTypes';
import {PythonIcon} from '../SvgIcons';
import InstalledPythons from './InstalledPythons/InstalledPythons';
import Venv from './VirtualEnvironments/Venv';

export default function PythonToolkitPage() {
  const [installedPythons, setInstalledPythons] = useState<PythonInstallation[]>([]);
  const [isLoadingPythons, setIsLoadingPythons] = useState<boolean>(false);

  const [currentTab, setCurrentTab] = useState<Key>('installation');

  return (
    <div className="size-full p-5">
      <CardsContainer
        title="Python Toolkit"
        icon={<PythonIcon className="size-6 mr-2" />}
        extraClassNames="mr-3 size-full overflow-hidden"
        subTitle="Manage Python versions, virtual environments, packages, requirements and more.">
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
        <ScrollShadow className="flex-1 p-4">
          <InstalledPythons
            installedPythons={installedPythons}
            isLoadingPythons={isLoadingPythons}
            visible={currentTab === 'installation'}
            setIsLoadingPythons={setIsLoadingPythons}
            setInstalledPythons={setInstalledPythons}
          />
          <Venv
            visible={currentTab === 'venv'}
            installedPythons={installedPythons}
            isLoadingPythons={isLoadingPythons}
          />
        </ScrollShadow>
      </CardsContainer>
    </div>
  );
}
