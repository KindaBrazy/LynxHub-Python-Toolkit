import {useTabsState} from '../../../../src/renderer/src/App/Redux/Reducer/TabsReducer';
import {usePythonToolkitState} from '../reducer';
import CardMenu_Modals from './CardMenu_Modals';

export default function CardMenuModal() {
  const activeTab = useTabsState('activeTab');

  const cards = usePythonToolkitState('menuModal');

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
