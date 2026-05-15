import {Button, Chip, Modal, SearchField, Spinner, useOverlayState} from '@heroui/react';
import EmptyStateCard from '@lynx/components/EmptyStateCard';
import TabModal from '@lynx/components/TabModal';
import {topToast} from '@lynx/layouts/ToastProviders';
import filesIpc from '@lynx_shared/ipc/files';
import {Checklist, Diskette, DocumentsMinimalistic, DocumentText} from '@solar-icons/react-perf/BoldDuotone';
import {isEmpty} from 'lodash-es';
import {Plus, X} from 'lucide-react';
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
  const scrollRef = useRef<OverlayScrollbarsComponentRef>(null);

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

  const deselect = () => {
    setFilePath('');
    pIpc.setReqPath({id, path: ''});
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
          <div className="flex flex-row gap-x-1 items-center w-full">
            <Button variant="tertiary" onPress={openFilePath} fullWidth>
              <DocumentText />
              {filePath || 'Select or create requirements file'}
            </Button>
            <Button onPress={deselect} variant="tertiary" className="shrink-0" isIconOnly>
              <X />
            </Button>
          </div>
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
        </Modal.Header>
        <Modal.Body className="pr-0 pl-2 pt-4 scrollbar-hide">
          {isEmpty(filePath) ? (
            <div className="size-full text-center mb-2">
              <EmptyStateCard
                variant="transparent"
                className="size-full"
                icon={<DocumentsMinimalistic className="size-20" />}
                title="Select or create a requirements file to continue."
              />
            </div>
          ) : isEmpty(requirements) ? (
            <div className="size-full text-center mb-2">
              <EmptyStateCard
                description={
                  <span className="flex flex-row items-center gap-x-1">
                    Add requirements using the <Plus className="text-blue-400 size-3.5" /> button.
                  </span>
                }
                title={
                  <span className="text-semi-muted text-base">
                    The <span className="font-semibold text-blue-400">{filePath.split(/[\/\\]/).pop()}</span> file is
                    empty.
                  </span>
                }
                variant="transparent"
                className="size-full"
                icon={<DocumentText className="size-20" />}
              />
            </div>
          ) : (
            <RequirementsManager scrollRef={scrollRef} requirements={searchReqs} setRequirements={setRequirements} />
          )}
        </Modal.Body>
        <Modal.Footer className="py-3">
          <Button isPending={isSaving} onPress={handleSaveRequirements}>
            {isSaving ? <Spinner size="sm" color="current" /> : <Diskette className="size-3.5" />}
            {!isSaving && 'Save'}
          </Button>
        </Modal.Footer>
      </TabModal>
      <Button size="sm" variant="tertiary" onPress={state.open}>
        <Checklist />
        Requirements
      </Button>
    </>
  );
}
