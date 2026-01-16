import {useEffect} from 'react';
import {useDispatch} from 'react-redux';

import {useTabsState} from '../../../../../src/renderer/main_window/redux/reducers/tabs';
import {AppDispatch} from '../../../../../src/renderer/main_window/redux/store';
import {PythonToolkitActions, usePythonToolkitState} from '../../reducer';
import Modals from './Modals';

export default function Settings() {
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
        <Modals
          isOpen={modal.isOpen}
          context={modal.context}
          key={`${modal.context.id}_card`}
          show={activeTab === modal.context.tabID ? 'flex' : 'hidden'}
        />
      ))}
    </>
  );
}
