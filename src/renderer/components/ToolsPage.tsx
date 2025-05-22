import {Button, Card, CardFooter, Image} from '@heroui/react';
import {Typography} from 'antd';
import {useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {tabsActions, useTabsState} from '../../../../src/renderer/src/App/Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../../src/renderer/src/App/Redux/Store';
import {Play_Icon} from '../../../../src/renderer/src/assets/icons/SvgIcons/SvgIcons';
import {useCacheImage} from '../Hooks';
import PythonToolkitModal from './Python/PythonToolkitModal';
import {Python_Color_Icon} from './SvgIcons';
import UIProvider from './UIProvider';

const title: string = 'Python Toolkit';
const desc: string = 'Manage Python versions, virtual environments, packages, requirements files, and more.';
const bgUrl: string =
  'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/f5fb4d81-745e-45af-b85e-485cfd61263c/' +
  'width=300/00014-503501982.jpeg';

export default function ToolsPage() {
  const dispatch = useDispatch<AppDispatch>();

  const activeTab = useTabsState('activeTab');
  const tabs = useTabsState('tabs');

  const [prevTabTitle, setPrevTabTitle] = useState<string | undefined>(tabs.find(tab => tab.id === activeTab)?.title);

  const [isOpen, setIsOpen] = useState(false);
  const [tabID, setTabID] = useState<string>('');

  const bg = useCacheImage('python-toolkit-bg', bgUrl);

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
  };

  const show = useMemo(() => (activeTab === tabID ? 'flex' : 'hidden'), [activeTab, tabID]);

  return (
    <UIProvider>
      <Card
        className={
          `w-[276px] h-[367px] cursor-default shadow-md !transition border-1 ` +
          `border-foreground/5 duration-300 hover:shadow-xl dark:bg-[#3d3d3d] relative`
        }
        radius="lg">
        {bg && <Image src={bg} className="bottom-16 rounded-none" />}
        <div className={'absolute top-4 left-1/2 -translate-x-1/2 z-10 backdrop-blur-md p-4 rounded-full'}>
          <Python_Color_Icon className="size-[6.2rem] hover:scale-110 transition duration-300" />
        </div>
        <div
          className={
            'absolute bottom-[4.4rem] z-10 left-1/2 -translate-x-1/2' +
            ' inset-x-0 w-full text-center backdrop-blur-md bg-foreground-100/70 py-4' +
            ' flex-col flex gap-y-2'
          }>
          <span className="font-bold text-xl hover:opacity-50 transition duration-300">{title}</span>
          <Typography.Paragraph
            ellipsis={{
              rows: 2,
              tooltip: {title: desc, mouseEnterDelay: 0.5},
            }}
            className={
              'mx-6 !mb-0 text-center hover:dark:!text-foreground hover:!text-foreground' +
              ' !text-foreground-600 dark:!text-foreground-500 font-semibold transition duration-300'
            }
            type="secondary">
            {desc}
          </Typography.Paragraph>
        </div>
        <CardFooter className="absolute z-10 bottom-0 py-4 bg-foreground-100">
          <Button color="primary" onPress={openModal} className="hover:scale-105" fullWidth>
            <Play_Icon className="size-[1.1rem]" />
          </Button>
        </CardFooter>
      </Card>
      <PythonToolkitModal show={show} isOpen={isOpen} setIsOpen={setIsOpen} />
    </UIProvider>
  );
}
