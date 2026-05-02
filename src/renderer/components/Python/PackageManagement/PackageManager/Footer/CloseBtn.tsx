import {Button, CloseButton, Description, Popover} from '@heroui-v3/react';
import {memo, useCallback, useState} from 'react';

import pIpc from '../../../../../PIpc';

type Props = {isCheckingUpdates: boolean; isUpdating: boolean; closePackageManager: () => void};

const CloseBtn = memo(({isCheckingUpdates, isUpdating, closePackageManager}: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const closePopover = useCallback(() => {
    setIsOpen(false);
  }, []);

  const abort = useCallback(() => {
    if (isUpdating) {
      pIpc.abortUpdating();
    } else if (isCheckingUpdates) {
      pIpc.abortUpdateCheck();
    }

    setIsOpen(false);
    closePackageManager();
  }, [isCheckingUpdates, isUpdating]);

  if (isUpdating || isCheckingUpdates) {
    return (
      <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
        <CloseButton className="absolute top-4 right-4" />
        <Popover.Content className="max-w-sm">
          <Popover.Dialog>
            <Popover.Arrow />
            <Popover.Heading>{isUpdating ? 'Update' : 'Update check'} in progress</Popover.Heading>
            <Description>
              Closing now will abort the {isUpdating ? 'update' : 'update check'}. Are you sure you want to continue?
            </Description>
            <div className="flex flex-row justify-end gap-x-2">
              <Button size="sm" variant="secondary" onPress={closePopover}>
                Cancel
              </Button>
              <Button size="sm" onPress={abort} variant="danger-soft">
                Abort Anyway
              </Button>
            </div>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>
    );
  }

  return <CloseButton onPress={closePackageManager} className="absolute top-4 right-4" />;
});

export default CloseBtn;
