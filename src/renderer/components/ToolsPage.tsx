import {Button, ButtonGroup, Card, Image} from '@heroui/react';
import {useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {tabsActions, useTabsState} from '../../../../src/renderer/src/App/Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../../src/renderer/src/App/Redux/Store';
import {Play_Icon, SettingsMinimal_Icon} from '../../../../src/renderer/src/assets/icons/SvgIcons/SvgIcons';
import {useCacheImage} from '../Hooks';
import pIpc from '../PIpc';
import {PythonToolkitActions} from '../reducer';
import PythonToolkitModal from './Python/PythonToolkitModal';
import UIProvider from './UIProvider';

const title: string = 'Python Toolkit';
const desc: string = 'Manage Python versions, virtual environments, packages, requirements files, and more.';
const iconUrl: string =
  'https://raw.githubusercontent.com/KindaBrazy/LynxHub-Python-Toolkit/refs/heads/source_ea/Icon.png';

export default function ToolsPage() {
  const dispatch = useDispatch<AppDispatch>();

  const activeTab = useTabsState('activeTab');
  const tabs = useTabsState('tabs');

  const [prevTabTitle, setPrevTabTitle] = useState<string | undefined>(tabs.find(tab => tab.id === activeTab)?.title);

  const [isOpen, setIsOpen] = useState(false);
  const [tabID, setTabID] = useState<string>('');

  const iconSrc = useCacheImage('python-toolkit-icon', iconUrl);

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
      <Card
        className={
          'w-[276px] h-[367px] relative group transform cursor-default border-1 border-foreground/10 ' +
          'transition-all duration-300 hover:-translate-y-1 shadow-small hover:shadow-medium'
        }
        as={'div'}
        isPressable>
        {/* Background with gradient overlay */}
        <div className={'absolute inset-0 rounded-2xl bg-white dark:bg-stone-900'} />

        {/* Content container */}
        <div className="relative h-full flex flex-col justify-between p-6">
          {/* Icon section */}
          <div className="mt-2 flex justify-center">
            {iconSrc && <Image radius="none" src={iconSrc} className="size-20" />}
          </div>

          {/* Title and Description */}
          <div className="text-center space-y-3">
            <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
            <p className="text-foreground/70 text-sm leading-relaxed">{desc}</p>
          </div>

          {/* Play button */}
          <ButtonGroup className="flex justify-center">
            <Button radius="full" color="primary" onPress={openModal} fullWidth>
              <Play_Icon className="size-4" />
            </Button>
            <Button radius="full" onPress={openSettings} isIconOnly>
              <SettingsMinimal_Icon className="size-4" />
            </Button>
          </ButtonGroup>
        </div>

        {/* Subtle border glow */}
        <div className="absolute inset-0 rounded-2xl border border-white/20 pointer-events-none" />

        {/* Hover glow effect */}
        <div
          className={
            'absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0' +
            ' group-hover:opacity-100 transition-opacity duration-300 pointer-events-none'
          }
        />
      </Card>
      <PythonToolkitModal show={show} isOpen={isOpen} setIsOpen={setIsOpen} />
    </UIProvider>
  );
}
