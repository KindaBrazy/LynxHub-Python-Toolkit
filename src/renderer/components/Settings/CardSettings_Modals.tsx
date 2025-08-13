import {Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@heroui/react';
import {Divider} from 'antd';
import {useDispatch} from 'react-redux';

import {modalMotionProps} from '../../../../../src/renderer/src/App/Utils/Constants';
import {ContextType, PythonToolkitActions} from '../../reducer';
import UIProvider from '../UIProvider';
import Settings_CacheDirUsage from './Settings_CacheDirUsage';
import Settings_PkgString from './Settings_PkgString';
import Settings_Retry from './Settings_Retry';

type Props = {isOpen: boolean; context: ContextType; show: string};

export default function CardSettings_Modals({isOpen, context, show}: Props) {
  const dispatch = useDispatch();

  const onOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      dispatch(PythonToolkitActions.closeSettingsModal({tabID: context.tabID}));
      setTimeout(() => {
        dispatch(PythonToolkitActions.removeSettingsModal({tabID: context.tabID}));
      }, 500);
    }
  };

  return (
    <UIProvider>
      <Modal
        size="3xl"
        isOpen={isOpen}
        placement="center"
        isDismissable={false}
        scrollBehavior="inside"
        onOpenChange={onOpenChange}
        motionProps={modalMotionProps}
        classNames={{backdrop: `!top-10 ${show}`, wrapper: `!top-10 pb-8 ${show}`}}
        hideCloseButton>
        <ModalContent className="overflow-hidden">
          {close => (
            <>
              <ModalHeader>Python Toolkit Settings</ModalHeader>
              <ModalBody>
                <Settings_Retry />
                <Divider variant="dashed" className="my-4" />
                <Settings_PkgString />
                <Divider variant="dashed" className="my-4" />
                <Settings_CacheDirUsage />
              </ModalBody>
              <ModalFooter>
                <Button onPress={close} variant="light" color="warning">
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </UIProvider>
  );
}
