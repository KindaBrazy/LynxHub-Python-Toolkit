import {Button} from '@heroui/react';
import {useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {ToolsCard} from '../../../../src/renderer/main_window/components/ToolsCard';
import {tabsActions, useTabsState} from '../../../../src/renderer/main_window/redux/reducers/tabs';
import {AppDispatch} from '../../../../src/renderer/main_window/redux/store';
import {SettingsMinimal_Icon} from '../../../../src/renderer/shared/assets/icons';
import pIpc from '../PIpc';
import {PythonToolkitActions} from '../reducer';
import {cacheUrl} from '../Utils';
import PythonToolkitModal from './Python/PythonToolkitModal';
import UIProvider from './UIProvider';

const title: string = 'Python Toolkit';
const desc: string = 'Manage Python versions, virtual environments, packages, requirements files, and more.';
const iconUrl: string =
  'https://raw.githubusercontent.com/KindaBrazy/LynxHub-Python-Toolkit/refs/heads/metadata/icon.png';

export default function ToolsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const icon = cacheUrl(iconUrl);

  const activeTab = useTabsState('activeTab');
  const tabs = useTabsState('tabs');

  const [prevTabTitle, setPrevTabTitle] = useState<string | undefined>(tabs.find(tab => tab.id === activeTab)?.title);

  const [isOpen, setIsOpen] = useState(false);
  const [tabID, setTabID] = useState<string>('');

  useEffect(() => {
    if (isOpen && tabID === activeTab) dispatch(tabsActions.setTabTitle({tabID, title}));
  }, [activeTab, tabID, isOpen]);

  useEffect(() => {
    if (!tabs.find(tab => tab.id === activeTab)) {
      setIsOpen(false);
    }
  }, [tabs, activeTab]);

  useEffect(() => {
    if (!isOpen && prevTabTitle) dispatch(tabsActions.setActiveTabTitle(prevTabTitle));
  }, [isOpen]);

  const openModal = () => {
    setIsOpen(true);
    setTabID(activeTab);
    setPrevTabTitle(tabs.find(tab => tab.id === activeTab)?.title);
    dispatch(tabsActions.setActiveTabTitle(title));
    pIpc.getAssociates().then(associates => dispatch(PythonToolkitActions.setAssociates(associates || [])));
  };

  const openSettings = () => {
    dispatch(PythonToolkitActions.openSettingsModal({title: '', id: '', tabID: activeTab}));
  };

  const show = useMemo(() => (activeTab === tabID ? 'flex' : 'hidden'), [activeTab, tabID]);

  return (
    <UIProvider>
      <ToolsCard
        footer={
          <Button as="div" variant="flat" color="primary" onPress={openSettings} isIconOnly>
            <SettingsMinimal_Icon className="size-4" />
          </Button>
        }
        // @ts-expect-error Them image url can be undefined
        icon={icon}
        title={title}
        description={desc}
        onPress={openModal}
      />
      <PythonToolkitModal show={show} isOpen={isOpen} setIsOpen={setIsOpen} />
    </UIProvider>
  );
}
