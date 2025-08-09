import {useEffect} from 'react';
import {useDispatch} from 'react-redux';

import {useTabsState} from '../../../../../src/renderer/src/App/Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../../../src/renderer/src/App/Redux/Store';
import {PythonToolkitActions, usePythonToolkitState} from '../../reducer';
import CardSettings_Modals from './CardSettings_Modals';

export default function SettingsModal() {
  const dispatch = useDispatch<AppDispatch>();
  const activeTab = useTabsState('activeTab');
  const tabs = useTabsState('tabs');

  const modals = usePythonToolkitState('settingsModal');

  useEffect(() => {
    modals.forEach(modal => {
      const exist = tabs.some(tab => tab.id === modal.context.tabID);
      if (!exist) {
        dispatch(PythonToolkitActions.closeSettingsModal({tabID: modal.context.tabID}));
        setTimeout(() => {
          dispatch(PythonToolkitActions.removeSettingsModal({tabID: modal.context.tabID}));
        }, 500);
      }
    });
  }, [tabs, modals, dispatch]);

  return (
    <>
      {modals.map(modal => (
        <CardSettings_Modals
          isOpen={modal.isOpen}
          context={modal.context}
          key={`${modal.context.id}_card`}
          show={activeTab === modal.context.tabID ? 'flex' : 'hidden'}
        />
      ))}
    </>
  );
}
