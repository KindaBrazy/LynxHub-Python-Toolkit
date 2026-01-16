import {useEffect} from 'react';
import {useDispatch} from 'react-redux';

import {useTabsState} from '../../../../src/renderer/main_window/redux/reducers/tabs';
import {AppDispatch} from '../../../../src/renderer/main_window/redux/store';
import {PythonToolkitActions, usePythonToolkitState} from '../reducer';
import CardMenu_Modals from './CardMenu_Modals';

export default function CardMenuModal() {
  const dispatch = useDispatch<AppDispatch>();
  const activeTab = useTabsState('activeTab');
  const tabs = useTabsState('tabs');

  const cards = usePythonToolkitState('menuModal');

  useEffect(() => {
    cards.forEach(card => {
      const exist = tabs.some(tab => tab.id === card.context.tabID);
      if (!exist) {
        dispatch(PythonToolkitActions.closeMenuModal({tabID: card.context.tabID}));
        setTimeout(() => {
          dispatch(PythonToolkitActions.removeMenuModal({tabID: card.context.tabID}));
        }, 500);
      }
    });
  }, [tabs, cards, dispatch]);

  return (
    <>
      {cards.map(card => (
        <CardMenu_Modals
          isOpen={card.isOpen}
          context={card.context}
          key={`${card.context.id}_card`}
          show={activeTab === card.context.tabID ? 'flex' : 'hidden'}
        />
      ))}
    </>
  );
}
