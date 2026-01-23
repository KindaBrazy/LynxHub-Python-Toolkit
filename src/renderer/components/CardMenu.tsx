import {DropdownItem, DropdownSection} from '@heroui/react';
import {UseCardStoreType} from '@lynx_common/types/plugins/extensions';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {useTabsState} from '../../../../src/renderer/main_window/redux/reducers/tabs';
import {ModulesThatSupportPython} from '../../cross/CrossExtConstants';
import {PythonToolkitActions} from '../reducer';
import {Python_Icon} from './SvgIcons';

type Props = {useCardStore: UseCardStoreType};

export default function CardMenu({useCardStore}: Props) {
  const activeTab = useTabsState('activeTab');
  const dispatch = useDispatch();

  const id = useCardStore(state => state.id);
  const title = useCardStore(state => state.title);
  const setMenuIsOpen = useCardStore(state => state.setMenuIsOpen);

  const onPress = useCallback(() => {
    dispatch(PythonToolkitActions.openMenuModal({title, id, tabID: activeTab}));
    setMenuIsOpen(false);
  }, [setMenuIsOpen, title, id, activeTab]);

  if (!ModulesThatSupportPython.includes(id)) return null;

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
