import {Modal, Separator, UseOverlayStateReturn} from '@heroui-v3/react';
import TabModal from '@lynx/components/TabModal';

import CacheDirUsage from './CacheDirUsage';
import Concurrent from './Concurrent';
import PkgString from './PkgString';
import Retry from './Retry';

type Props = {state: UseOverlayStateReturn};

export default function SettingsModal({state}: Props) {
  return (
    <TabModal
      isOpen={state.isOpen}
      dialogClassName="max-w-4xl"
      onOpenChange={state.setOpen}
      containerClassName="h-fit! max-h-fit!">
      <Modal.CloseTrigger />
      <Modal.Header>
        <Modal.Heading>Python Toolkit Settings</Modal.Heading>
      </Modal.Header>

      <Modal.Body>
        <Retry />
        <Concurrent />
        <Separator className="my-4" />
        <PkgString />
        <Separator className="my-4" />
        <CacheDirUsage />
      </Modal.Body>
    </TabModal>
  );
}
