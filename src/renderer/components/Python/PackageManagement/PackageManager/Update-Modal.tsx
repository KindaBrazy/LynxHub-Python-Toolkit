import {Button, Modal} from '@heroui/react';
import {UseOverlayStateReturn} from '@heroui/react';
import EmptyStateCard from '@lynx/components/EmptyStateCard';
import TabModal from '@lynx/components/TabModal';
import ptyIpc from '@lynx_shared/ipc/pty';
import {ShieldWarning} from '@solar-icons/react-perf/BoldDuotone';
import {memo, useEffect, useState} from 'react';

import TerminalView from './Terminal-View';

type Props = {state: UseOverlayStateReturn};

const UpdateModal = memo(({state}: Props) => {
  const [isDone, setIsDone] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  useEffect(() => {
    const offExit = ptyIpc.onExit(id => {
      if (id === 'python-update') {
        setIsDone(true);
        setShowConfirm(true);
      }
    });

    return () => offExit();
  }, []);

  // Reset confirmation state when modal is closed/opened
  useEffect(() => {
    if (!state.isOpen) {
      setShowConfirm(false);
    }
  }, [state.isOpen]);

  const handleCloseClick = () => {
    setShowConfirm(true);
  };

  const confirmClose = () => {
    state.close();
  };

  const cancelClose = () => {
    setShowConfirm(false);
  };

  return (
    <TabModal isOpen={state.isOpen} onOpenChange={state.setOpen}>
      <Modal.Header>
        <Modal.Heading>Console</Modal.Heading>
      </Modal.Header>
      <Modal.Body>
        {showConfirm && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <EmptyStateCard
              variant="secondary"
              className="size-full py-8"
              icon={<ShieldWarning className="size-14 text-warning" />}
              description={isDone ? 'Close this window?' : 'The command will still execute in the background.'}
              title={isDone ? 'The terminal is done and exited' : 'Are you sure you want to close this window?'}
            />
          </div>
        )}
        <div className={showConfirm ? 'hidden' : 'block'}>
          <TerminalView />
        </div>
      </Modal.Body>
      <Modal.Footer>
        {showConfirm ? (
          <div className="flex w-full gap-2 justify-end">
            <Button size="sm" variant="ghost" onPress={cancelClose}>
              Back to Terminal
            </Button>
            <Button size="sm" variant="danger-soft" onPress={confirmClose}>
              Close Window
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="danger-soft" onPress={handleCloseClick}>
            Close
          </Button>
        )}
      </Modal.Footer>
    </TabModal>
  );
});

export default UpdateModal;
