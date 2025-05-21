import {Button, Modal, ModalBody, ModalContent, ModalHeader} from '@heroui/react';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {useCallback, useState} from 'react';

import {useAppState} from '../../../../../../../src/renderer/src/App/Redux/Reducer/AppReducer';
import {Add_Icon} from '../../../../../../../src/renderer/src/assets/icons/SvgIcons/SvgIcons';
import Header_Installer from './Header_Installer';

type Props = {
  pythonPath: string;
  refresh: () => void;
  show: string;
};

export default function Header_InstallerModal({refresh, pythonPath, show}: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const isDarkMode = useAppState('darkMode');

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <Button radius="sm" variant="solid" startContent={<Add_Icon />} onPress={() => setIsOpen(true)}>
        Install Package
      </Button>
      <Modal
        size="xl"
        isOpen={isOpen}
        onClose={close}
        placement="center"
        isDismissable={false}
        scrollBehavior="inside"
        classNames={{backdrop: `!top-10 ${show}`, wrapper: `!top-10 pb-8 ${show}`}}>
        <ModalContent>
          <ModalHeader className="pb-1 justify-center">Python Package Installer</ModalHeader>
          <ModalBody className="scrollbar-hide px-0 pt-0">
            <OverlayScrollbarsComponent
              options={{
                overflow: {x: 'hidden', y: 'scroll'},
                scrollbars: {
                  autoHide: 'move',
                  clickScroll: true,
                  theme: isDarkMode ? 'os-theme-light' : 'os-theme-dark',
                },
              }}>
              <Header_Installer close={close} refresh={refresh} pythonPath={pythonPath} />
            </OverlayScrollbarsComponent>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
