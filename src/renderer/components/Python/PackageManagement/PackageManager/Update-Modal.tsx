import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@heroui/react';
import ptyIpc from '@lynx_shared/ipc/pty';
import {Dispatch, memo, SetStateAction, useEffect, useState} from 'react';

import TerminalView from './Terminal-View';

type Props = {isOpen: boolean; setIsOpen: Dispatch<SetStateAction<boolean>>; show: string};

const UpdateModal = memo(({isOpen, setIsOpen, show}: Props) => {
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
    setIsOpen(false);
  };

  return (
    <Modal
      size="3xl"
      isOpen={isOpen}
      placement="center"
      scrollBehavior="inside"
      onOpenChange={setIsOpen}
      classNames={{backdrop: `!top-10 ${show}`, wrapper: `!top-10 pb-8 ${show}`}}
      hideCloseButton>
      <ModalContent>
        <ModalHeader className="justify-center">Console Output...</ModalHeader>
        <ModalBody>
          <TerminalView />
        </ModalBody>
        <ModalFooter>
          <Popover
            size="sm"
            isOpen={isPopoverOpen}
            onOpenChange={setIsPopoverOpen}
            className="max-w-xs before:bg-foreground-100"
            showArrow>
            <PopoverTrigger>
              <Button variant="flat" color="warning">
                Close
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-4 flex flex-col gap-y-3 border border-foreground-100">
              {isDone
                ? 'The terminal is done and exited, close this window?'
                : 'Are you sure you want to close this window? the command will be still executing in background'}

              <Button size="sm" variant="flat" onPress={Close} color="warning" fullWidth>
                Close
              </Button>
            </PopoverContent>
          </Popover>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});

export default UpdateModal;
