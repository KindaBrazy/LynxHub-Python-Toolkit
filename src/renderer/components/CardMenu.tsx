import {DropdownItem, DropdownSection} from '@heroui/react';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {CardsDataManager} from '../../../../src/renderer/src/App/Components/Cards/CardsDataManager';
import {useTabsState} from '../../../../src/renderer/src/App/Redux/Reducer/TabsReducer';
import {PYTHON_SUPPORTED_AI} from '../../cross/CrossExtConstants';
import {PythonToolkitActions} from '../reducer';
import {Python_Icon} from './SvgIcons';

type Props = {
  context: CardsDataManager;
};

export default function CardMenu({context}: Props) {
  const activeTab = useTabsState('activeTab');
  const dispatch = useDispatch();

  const onPress = useCallback(() => {
    dispatch(PythonToolkitActions.openMenuModal({title: context.title, id: context.id, tabID: activeTab}));
    context?.setMenuIsOpen(false);
  }, [context, activeTab]);

  if (!PYTHON_SUPPORTED_AI.includes(context.id)) return null;

  return (
    <DropdownSection key="python_toolkit" showDivider>
      <DropdownItem
        onPress={onPress}
        key="python_deps"
        title="Dependencies"
        className="cursor-default"
        startContent={<Python_Icon className="size-3" />}
      />
    </DropdownSection>
  );
}
