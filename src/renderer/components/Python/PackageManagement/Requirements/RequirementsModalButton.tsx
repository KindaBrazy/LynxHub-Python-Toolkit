import {Button, Chip, Modal, SearchField, useOverlayState} from '@heroui-v3/react';
import EmptyStateCard from '@lynx/components/EmptyStateCard';
import TabModal from '@lynx/components/TabModal';
import {topToast} from '@lynx/layouts/ToastProviders';
import filesIpc from '@lynx_shared/ipc/files';
import {Checklist, Diskette, File} from '@solar-icons/react-perf/BoldDuotone';
import {isEmpty} from 'lodash-es';
import {Plus} from 'lucide-react';
import {OverlayScrollbarsComponentRef} from 'overlayscrollbars-react';
import {Dispatch, SetStateAction, useEffect, useRef, useState} from 'react';

import {searchInStrings} from '../../../../../../../src/renderer/mainWindow/utils';
import {RequirementData} from '../../../../../cross/CrossExtTypes';
import pIpc from '../../../../PIpc';
import RequirementsManager from './RequirementsManager';

type Props = {
  id: string;
  projectPath?: string;
  setIsReqAvailable: Dispatch<SetStateAction<boolean>>;
  setReqPackageCount: Dispatch<SetStateAction<number>>;
};

export default function RequirementsBtn({id, projectPath, setIsReqAvailable, setReqPackageCount}: Props) {
  const state = useOverlayState();
  const [requirements, setRequirements] = useState<RequirementData[]>([]);
  const [filePath, setFilePath] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');

  const [searchReqs, setSearchReqs] = useState<RequirementData[]>([]);

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
          topToast.success('Requirements saved successfully!');
        } else {
          topToast.danger('Failed to save requirements.');
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
      <TabModal isOpen={state.isOpen} onOpenChange={state.setOpen}>
        <Modal.CloseTrigger />
        <Modal.Header className="flex flex-col gap-y-2">
          <div className="flex flex-row justify-between">
            <div className="flex flex-row gap-x-2 items-center mb-2">
              <span>Manage Requirements</span>
              <Chip size="sm">{requirements.length}</Chip>
            </div>
          </div>
          <div>
            <Button variant="secondary" className="shrink-0" onPress={openFilePath} fullWidth>
              <File />
              {filePath || 'Choose or Create requirements file...'}
            </Button>
          </div>
          {!isEmpty(requirements) && (
            <div className="flex flex-row items-center gap-x-2">
              <SearchField name="search" variant="secondary" value={searchValue} onChange={setSearchValue} fullWidth>
                <SearchField.Group>
                  <SearchField.SearchIcon />
                  <SearchField.Input placeholder="Search..." />
                  <SearchField.ClearButton />
                </SearchField.Group>
              </SearchField>
              {!isEmpty(filePath) && (
                <Button variant="secondary" onPress={handleAddRequirement}>
                  <Plus size={14} />
                  Add
                </Button>
              )}
            </div>
          )}
        </Modal.Header>
        <Modal.Body className="pr-0 pl-2 pt-4 scrollbar-hide">
          {isEmpty(filePath) ? (
            <div className="size-full text-center mb-2">
              <EmptyStateCard
                action={
                  <Button variant="secondary" onPress={openFilePath}>
                    <File />
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
                    is empty. Add requirements using the <span className="font-bold text-primary-700">Add</span> button.
                  </span>
                }
                className="mx-4"
              />
            </div>
          ) : (
            <RequirementsManager scrollRef={scrollRef} requirements={searchReqs} setRequirements={setRequirements} />
          )}
        </Modal.Body>
        <Modal.Footer className="py-3">
          <Button isPending={isSaving} onPress={handleSaveRequirements}>
            {!isSaving && <Diskette className="size-3.5" />}
            {!isSaving && 'Save'}
          </Button>
        </Modal.Footer>
      </TabModal>
      <Button size="sm" variant="tertiary" onPress={state.open}>
        <Checklist />
        Manage Requirements
      </Button>
    </>
  );
}
