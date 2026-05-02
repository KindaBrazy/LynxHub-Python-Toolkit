import {Button, Modal, Popover} from '@heroui-v3/react';
import {UseOverlayStateReturn} from '@heroui-v3/react';
import TabModal from '@lynx/components/TabModal';
import ptyIpc from '@lynx_shared/ipc/pty';
import {memo, useEffect, useState} from 'react';

import TerminalView from './Terminal-View';

type Props = {state: UseOverlayStateReturn};

const UpdateModal = memo(({state}: Props) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(false);

  useEffect(() => {
    const offExit = ptyIpc.onExit(id => {
      if (id === 'python-update') {
        setIsPopoverOpen(true);
        setIsDone(true);
      }
    });

    return () => offExit();
  }, []);

  const Close = () => {
    setIsPopoverOpen(false);
    state.close();
  };

  return (
    <TabModal isOpen={state.isOpen} onOpenChange={state.setOpen}>
      <Modal.Header>
        <Modal.Heading>Console Output...</Modal.Heading>
      </Modal.Header>
      <Modal.Body>
        <TerminalView />
      </Modal.Body>
      <Modal.Footer>
        <Popover isOpen={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <Button variant="danger-soft">Close</Button>
          <Popover.Content className="max-w-xs">
            <Popover.Dialog>
              <Popover.Arrow />
              <Popover.Heading>
                {isDone
                  ? 'The terminal is done and exited, close this window?'
                  : 'Are you sure you want to close this window? the command will be still executing in background'}
              </Popover.Heading>
              <Button size="sm" onPress={Close} variant="danger-soft" fullWidth>
                Close
              </Button>
            </Popover.Dialog>
          </Popover.Content>
        </Popover>
      </Modal.Footer>
    </TabModal>
  );
});

export default UpdateModal;
