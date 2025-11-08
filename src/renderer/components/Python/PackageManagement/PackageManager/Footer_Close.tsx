import {Button, Popover, PopoverContent, PopoverTrigger} from '@heroui/react';
import {memo, useCallback, useState} from 'react';

import pIpc from '../../../../PIpc';

type Props = {isCheckingUpdates: boolean; closePackageManager: () => void};

const Footer_Close = ({isCheckingUpdates, closePackageManager}: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const cancel = useCallback(() => {
    pIpc.abortUpdateCheck();
    setIsOpen(false);
    closePackageManager();
  }, []);

  if (isCheckingUpdates) {
    return (
      <Popover
        isOpen={isOpen}
        placement="top"
        onOpenChange={setIsOpen}
        className="max-w-sm before:bg-foreground-100"
        showArrow>
        <PopoverTrigger>
          <Button variant="light" color="warning">
            Close
          </Button>
        </PopoverTrigger>
        <PopoverContent className="border border-foreground-100">
          <div className="flex flex-col p-2 gap-y-3">
            <div className="font-semibold text-warning">Update check in progress</div>
            <div>Closing now will cancel the update check. Are you sure you want to continue?</div>
            <div className="flex flex-row justify-end gap-x-2">
              <Button size="sm" variant="flat" onPress={close}>
                Cancel
              </Button>
              <Button size="sm" variant="flat" color="danger" onPress={cancel}>
                Close Anyway
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Button variant="light" color="warning" onPress={closePackageManager}>
      Close
    </Button>
  );
};

export default memo(Footer_Close);
