import {Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@nextui-org/react';
import {Empty, List} from 'antd';
import {useState} from 'react';

import {modalMotionProps} from '../../../../src/App/Utils/Constants';
import {Add_Icon} from '../../../../src/assets/icons/SvgIcons/SvgIcons1';
import {Checklist_Icon} from '../../SvgIcons';

export default function RequirementsBtn() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <Modal
        size="2xl"
        isOpen={isOpen}
        scrollBehavior="inside"
        motionProps={modalMotionProps}
        onClose={() => setIsOpen(false)}
        classNames={{backdrop: '!top-10', wrapper: '!top-10 pb-8'}}
        hideCloseButton>
        <ModalContent className="overflow-hidden">
          <ModalHeader className="bg-foreground-200 dark:bg-LynxRaisinBlack justify-between">
            <span>Requirements</span>
            <Button size="sm" startContent={<Add_Icon />}>
              Add
            </Button>
          </ModalHeader>
          <ModalBody>
            <List
              locale={{
                emptyText: <Empty description="No requirement found." image={Empty.PRESENTED_IMAGE_SIMPLE} />,
              }}
            />
          </ModalBody>
          <ModalFooter className="bg-foreground-200 dark:bg-LynxRaisinBlack">
            <Button size="sm" color="warning" variant="faded" onPress={() => setIsOpen(false)} fullWidth>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Button
        size="sm"
        radius="sm"
        variant="solid"
        onPress={() => setIsOpen(true)}
        startContent={<Checklist_Icon className="size-3.5" />}>
        Requirements
      </Button>
    </>
  );
}
