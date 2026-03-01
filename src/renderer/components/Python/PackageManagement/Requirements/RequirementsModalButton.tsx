import {Button, Chip, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@heroui/react';
import EmptyStateCard from '@lynx/components/EmptyStateCard';
import {lynxTopToast} from '@lynx/utils/hooks';
import filesIpc from '@lynx_shared/ipc/files';
import {Checklist, Diskette, File} from '@solar-icons/react-perf/BoldDuotone';
import {isEmpty} from 'lodash';
import {Plus} from 'lucide-react';
import {OverlayScrollbarsComponentRef} from 'overlayscrollbars-react';
import {Dispatch, SetStateAction, useEffect, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {searchInStrings} from '../../../../../../../src/renderer/mainWindow/utils';
import {modalMotionProps} from '../../../../../../../src/renderer/mainWindow/utils/constants';
import {Circle_Icon} from '../../../../../../../src/renderer/shared/assets/icons';
import {RequirementData} from '../../../../../cross/CrossExtTypes';
import pIpc from '../../../../PIpc';
import RequirementsManager from './RequirementsManager';

type Props = {
  id: string;
  projectPath?: string;
  setIsReqAvailable: Dispatch<SetStateAction<boolean>>;
  show: string;
  setReqPackageCount: Dispatch<SetStateAction<number>>;
};

export default function RequirementsBtn({id, projectPath, setIsReqAvailable, show, setReqPackageCount}: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [requirements, setRequirements] = useState<RequirementData[]>([]);
  const [filePath, setFilePath] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');

  const [searchReqs, setSearchReqs] = useState<RequirementData[]>([]);

  const dispatch = useDispatch();

  useEffect(() => {
    setIsReqAvailable(!!filePath);
  }, [filePath]);

  useEffect(() => {
    const findReqs = () => {
      if (projectPath) {
        pIpc.findReq(projectPath).then(reqPath => {
          if (reqPath) {
            pIpc.setReqPath({id, path: reqPath});
            setFilePath(reqPath);
          }
        });
      }
    };

    pIpc
      .getReqPath(id)
      .then(reqPath => {
        if (reqPath) {
          setFilePath(reqPath);
        } else {
          findReqs();
        }
      })
      .catch(err => {
        console.log(err);
        findReqs();
      });
  }, [projectPath, id]);

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
    pIpc.readReqs(filePath).then(result => {
      setRequirements(result);
      setReqPackageCount(result.length);
    });
  }, [filePath]);

  const handleAddRequirement = () => {
    setRequirements(prevRequirements => [
      ...prevRequirements,
      {name: '', versionOperator: null, version: null, originalLine: '', autoFocus: true},
    ]);
    setReqPackageCount(prevState => prevState + 1);
    scrollToBottom();
  };

  const handleSaveRequirements = () => {
    if (filePath) {
      setIsSaving(true);
      pIpc.saveReqs(filePath, requirements).then(success => {
        if (success) {
          lynxTopToast(dispatch).success('Requirements saved successfully!');
        } else {
          lynxTopToast(dispatch).error('Failed to save requirements.');
        }
        setIsSaving(false);
      });
    }
  };

  const openFilePath = () => {
    filesIpc
      .openDlg({
        properties: ['openFile'],
        filters: [{name: 'Text', extensions: ['txt']}],
      })
      .then(file => {
        if (file) {
          setFilePath(file);
          pIpc.setReqPath({id, path: file});
        }
      });
  };

  return (
    <>
      <Modal
        size="3xl"
        isOpen={isOpen}
        placement="center"
        isDismissable={false}
        scrollBehavior="inside"
        motionProps={modalMotionProps}
        onClose={() => setIsOpen(false)}
        classNames={{backdrop: `top-10! ${show}`, wrapper: `top-10! pb-8 ${show}`}}
        hideCloseButton>
        <ModalContent className="overflow-hidden">
          <ModalHeader className="bg-foreground-200 dark:bg-LynxRaisinBlack flex flex-col gap-y-2">
            <div className="flex flex-row justify-between">
              <div className="flex flex-row gap-x-2 items-center mb-2">
                <span>Manage Requirements</span>
                <Chip size="sm">{requirements.length}</Chip>
              </div>
              {!isEmpty(filePath) && (
                <div className="flex gap-x-2">
                  <div>
                    <Button size="sm" variant="flat" onPress={handleAddRequirement} startContent={<Plus size={14} />}>
                      Add
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div>
              <Button
                endContent={<div />}
                onPress={openFilePath}
                className="shrink-0 justify-between"
                startContent={<File className="size-3.5" />}
                fullWidth>
                {filePath || 'Choose or Create requirements file...'}
              </Button>
            </div>
            {!isEmpty(requirements) && (
              <Input
                type="search"
                value={searchValue}
                onValueChange={setSearchValue}
                placeholder="Search requirements..."
                startContent={<Circle_Icon className="size-3.5" />}
              />
            )}
          </ModalHeader>
          <ModalBody className="pr-0 pl-2 pt-4 scrollbar-hide">
            {isEmpty(filePath) ? (
              <div className="size-full text-center mb-2">
                <EmptyStateCard
                  action={
                    <Button
                      variant="flat"
                      color="primary"
                      key="create_req_file"
                      onPress={openFilePath}
                      startContent={<File className="size-3.5" />}>
                      Choose or Create requirements file
                    </Button>
                  }
                  className="mx-4"
                  title="Select or create a requirements file to continue."
                />
              </div>
            ) : isEmpty(requirements) ? (
              <div className="size-full text-center mb-2">
                <EmptyStateCard
                  title={
                    <span>
                      The file <span className="font-bold text-primary-700">{filePath.split(/[\/\\]/).pop()}</span>
                      is empty. Add requirements using the <span className="font-bold text-primary-700">Add</span>{' '}
                      button.
                    </span>
                  }
                  className="mx-4"
                />
              </div>
            ) : (
              <RequirementsManager scrollRef={scrollRef} requirements={searchReqs} setRequirements={setRequirements} />
            )}
          </ModalBody>
          <ModalFooter className="py-3">
            <Button
              variant="flat"
              color="success"
              isLoading={isSaving}
              onPress={handleSaveRequirements}
              startContent={!isSaving && <Diskette className="size-3.5" />}>
              {!isSaving && 'Save'}
            </Button>
            <Button color="warning" variant="light" className="w-fit" onPress={() => setIsOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Button
        size="sm"
        variant="solid"
        onPress={() => setIsOpen(true)}
        startContent={<Checklist className="size-3.5" />}>
        Manage Requirements
      </Button>
    </>
  );
}
