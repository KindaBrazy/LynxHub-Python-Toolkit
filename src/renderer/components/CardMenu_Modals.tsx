import {Button} from '@heroui/react';
import {useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {tabsActions, useTabsState} from '../../../../src/renderer/src/App/Redux/Reducer/TabsReducer';
import {useInstalledCard} from '../../../../src/renderer/src/App/Utils/UtilHooks';
import pIpc from '../PIpc';
import {ContextType, PythonToolkitActions} from '../reducer';
import PackageManagerModal from './Python/PackageManagement/PackageManager/PackageManagerModal';
import UIProvider from './UIProvider';

type Props = {isOpen: boolean; context: ContextType; show: string};

export default function CardMenu_Modals({isOpen, context, show}: Props) {
  const activeTab = useTabsState('activeTab');
  const webUI = useInstalledCard(context.id);

  const dispatch = useDispatch();

  const tabs = useTabsState('tabs');

  const [prevTabTitle, setPrevTabTitle] = useState<string | undefined>(
    tabs.find(tab => tab.id === context.tabID)?.title,
  );

  useEffect(() => {
    setPrevTabTitle(tabs.find(tab => tab.id === context.tabID)?.title);
    dispatch(tabsActions.setTabTitle({tabID: context.tabID, title: `${context.title} Dependencies`}));
  }, []);

  useEffect(() => {
    if (isOpen && context.tabID === activeTab)
      dispatch(tabsActions.setTabTitle({tabID: context.tabID, title: `${context.title} Dependencies`}));
  }, [activeTab, context.tabID, isOpen]);

  const [pythonPath, setPythonPath] = useState<string>('');

  const onOpenChange = (value: boolean) => {
    if (!value) {
      dispatch(PythonToolkitActions.closeMenuModal({tabID: context.tabID}));
      setTimeout(() => {
        dispatch(PythonToolkitActions.removeMenuModal({tabID: context.tabID}));
      }, 500);
      if (prevTabTitle) dispatch(tabsActions.setTabTitle({tabID: context.tabID, title: prevTabTitle}));
    }
  };

  const handleDeselect = () => {
    pIpc.removeAssociate(context.id);
    setPythonPath('');
  };

  const actionButtons = useMemo(() => {
    return pythonPath
      ? [
          <Button
            size="sm"
            variant="flat"
            color="danger"
            key="reloacte_venv"
            className="!min-w-32"
            onPress={handleDeselect}>
            Deselect
          </Button>,
        ]
      : [];
  }, [pythonPath]);

  return (
    <UIProvider>
      <PackageManagerModal
        size="4xl"
        show={show}
        isOpen={isOpen}
        id={context.id}
        pythonPath={pythonPath}
        setIsOpen={onOpenChange}
        projectPath={webUI?.dir}
        setPythonPath={setPythonPath}
        actionButtons={actionButtons}
        title={`${context.title} Dependencies`}
      />
    </UIProvider>
  );
}
