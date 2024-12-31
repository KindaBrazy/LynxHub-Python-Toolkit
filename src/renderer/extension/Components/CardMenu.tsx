import {DropdownItem, DropdownSection} from '@nextui-org/react';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {PYTHON_SUPPORTED_AI} from '../../../cross/extension/CrossExtConstants';
import {CardsDataManager} from '../../src/App/Components/Cards/CardsDataManager';
import {PythonToolkitActions} from '../reducer';
import {Python_Icon} from './SvgIcons';

type Props = {
  context: CardsDataManager;
};

export default function CardMenu({context}: Props) {
  const dispatch = useDispatch();

  const onPress = useCallback(() => {
    dispatch(PythonToolkitActions.openMenuModal({title: context.title, id: context.id}));
    context?.setMenuIsOpen(false);
  }, [context]);

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
