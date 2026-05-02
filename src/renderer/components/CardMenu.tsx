import {DropdownItem, DropdownSection, Separator} from '@heroui-v3/react';
import {useCardOverlayState} from '@lynx/components/card/useCardOverlayState';
import {UseCardStoreType} from '@lynx/plugins/extensions/types';
import {useCallback} from 'react';

import {ModulesThatSupportPython} from '../../cross/CrossExtConstants';
import {DepsModalKey} from '../consts';
import {Python_Icon} from './SvgIcons';

type Props = {useCardStore: UseCardStoreType; useCardOverlayState: typeof useCardOverlayState};

export default function CardMenu({useCardStore, useCardOverlayState}: Props) {
  const state = useCardOverlayState(DepsModalKey);

  const id = useCardStore(state => state.id);
  const setMenuIsOpen = useCardStore(state => state.setMenuIsOpen);

  const onPress = useCallback(() => {
    state.open();
    setMenuIsOpen(false);
  }, [setMenuIsOpen, state]);

  if (!ModulesThatSupportPython.includes(id)) return null;

  return (
    <>
      <DropdownSection key="python_toolkit_menu">
        <DropdownItem onPress={onPress}>
          <Python_Icon className="size-3" />
          Dependencies
        </DropdownItem>
      </DropdownSection>
      <Separator className="bg-surface-secondary/70" />
    </>
  );
}
