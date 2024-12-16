import {Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@nextui-org/react';
import {Empty, message, Result} from 'antd';
import {isEmpty} from 'lodash';
import {OverlayScrollbarsComponentRef} from 'overlayscrollbars-react';
import {useEffect, useRef, useState} from 'react';

import {pythonChannels} from '../../../../../../cross/CrossExtensions';
import rendererIpc from '../../../../../src/App/RendererIpc';
import {modalMotionProps} from '../../../../../src/App/Utils/Constants';
import {searchInStrings} from '../../../../../src/App/Utils/UtilFunctions';
import {Add_Icon, Circle_Icon, File_Icon} from '../../../../../src/assets/icons/SvgIcons/SvgIcons1';
import {Checklist_Icon, Save_Icon} from '../../../SvgIcons';
import RequirementsManager from './RequirementsManager';

export type Requirement = {
  name: string;
  versionOperator: string | null;
  version: string | null;
  originalLine: string;
  autoFocus?: boolean;
};

export default function RequirementsBtn() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [filePath, setFilePath] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');

  const [searchReqs, setSearchReqs] = useState<Requirement[]>([]);

  useEffect(() => {
    setSearchReqs(requirements.filter(item => searchInStrings(searchValue, [item.name])));
  }, [searchValue, requirements]);

  const scrollRef = useRef<OverlayScrollbarsComponentRef>(null);

  const scrollToBottom = () => {
    const {current} = scrollRef;
    const osInstance = current?.osInstance();
    if (!osInstance) {
      return;
    }
    const {scrollOffsetElement} = osInstance.elements();
    const {scrollHeight} = scrollOffsetElement;
    scrollOffsetElement.scrollTo({behavior: 'smooth', top: scrollHeight + 100});
  };

  useEffect(() => {
    window.electron.ipcRenderer.invoke(pythonChannels.readReqs, filePath).then(result => {
      setRequirements(result);
    });
  }, [filePath]);

  const handleAddRequirement = () => {
    setRequirements(prevRequirements => [
      ...prevRequirements,
      {name: '', versionOperator: null, version: null, originalLine: '', autoFocus: true},
    ]);
    scrollToBottom();
  };

  const handleSaveRequirements = () => {
    if (filePath) {
      setIsSaving(true);
      window.electron.ipcRenderer.invoke(pythonChannels.saveReqs, filePath, requirements).then(success => {
        if (success) {
          message.success('Requirements saved successfully!');
        } else {
          message.error('Error saving requirements.');
        }
        setIsSaving(false);
      });
    }
  };

  const openFilePath = () => {
    rendererIpc.file
      .openDlg({
        properties: ['openFile'],
        filters: [{name: 'Text', extensions: ['txt']}],
      })
      .then(file => {
        if (file) {
          setFilePath(file);
        }
      });
  };

  return (
    <>
      <Modal
        size="2xl"
        isOpen={isOpen}
        isDismissable={false}
        scrollBehavior="inside"
        motionProps={modalMotionProps}
        onClose={() => setIsOpen(false)}
        classNames={{backdrop: '!top-10', wrapper: '!top-10 pb-8'}}
        hideCloseButton>
        <ModalContent className="overflow-hidden">
          <ModalHeader className="bg-foreground-200 dark:bg-LynxRaisinBlack flex flex-col gap-y-2">
            <div className="flex flex-row justify-between">
              <span>Requirements</span>
              {!isEmpty(filePath) && (
                <div className="flex gap-x-2">
                  <Button size="sm" variant="faded" startContent={<Add_Icon />} onPress={handleAddRequirement}>
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="faded"
                    color="success"
                    isLoading={isSaving}
                    onPress={handleSaveRequirements}
                    startContent={!isSaving && <Save_Icon className="size-3.5" />}>
                    {!isSaving && 'Save'}
                  </Button>
                </div>
              )}
            </div>
            <Button
              size="sm"
              variant="faded"
              endContent={<div />}
              onPress={openFilePath}
              startContent={<File_Icon />}
              className="shrink-0 text-[10pt] justify-between"
              fullWidth>
              {filePath || 'Select or Create file...'}
            </Button>
            {!isEmpty(requirements) && (
              <Input
                size="sm"
                variant="faded"
                value={searchValue}
                onValueChange={setSearchValue}
                placeholder="Search for packages..."
                startContent={<Circle_Icon className="size-4" />}
              />
            )}
          </ModalHeader>
          <ModalBody className="pr-0 pl-2 pt-4 scrollbar-hide">
            {isEmpty(filePath) ? (
              <div className="size-full text-center mb-2">
                <Result
                  extra={
                    <Button key="create_req_file" onPress={openFilePath}>
                      Select or Create file
                    </Button>
                  }
                  title="Please select or create a Requirements file to get started."
                />
              </div>
            ) : isEmpty(requirements) ? (
              <div className="size-full text-center mb-2">
                <Empty
                  description={
                    <span>
                      The <span className="font-bold">{filePath.split('\\').pop()}</span> file is empty, Please click on
                      `Add` button above to add new condition.
                    </span>
                  }
                />
              </div>
            ) : (
              <RequirementsManager scrollRef={scrollRef} requirements={searchReqs} setRequirements={setRequirements} />
            )}
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
