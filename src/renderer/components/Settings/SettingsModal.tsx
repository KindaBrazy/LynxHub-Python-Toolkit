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

      <Modal.Body className="p-1 gap-y-4 flex flex-col">
        <Retry />
        <Concurrent />
        <Separator />
        <PkgString />
        <Separator />
        <CacheDirUsage />
      </Modal.Body>
    </TabModal>
  );
}
