import {Button, Chip, Modal, SearchField, Spinner, useOverlayState} from '@heroui/react';
import EmptyStateCard from '@lynx/components/EmptyStateCard';
import LynxTooltip from '@lynx/components/LynxTooltip';
import TabModal from '@lynx/components/TabModal';
import {searchInStrings} from '@lynx/utils';
import filesIpc from '@lynx_shared/ipc/files';
import {
  Checklist,
  Diskette,
  DocumentsMinimalistic,
  DocumentText,
  Import,
  ShieldWarning,
} from '@solar-icons/react-perf/BoldDuotone';
import {isEmpty} from 'lodash-es';
import {Plus, X} from 'lucide-react';
import {OverlayScrollbarsComponentRef} from 'overlayscrollbars-react';
import {Dispatch, SetStateAction, useEffect, useMemo, useRef, useState} from 'react';

import {RequirementData} from '../../../../../cross/CrossExtTypes';
import {toastHolder} from '../../../../DataHolder';
import pIpc from '../../../../PIpc';
import RenderTable from './RenderTable';

type Props = {
  id: string;
  projectPath?: string;
  setIsReqAvailable: Dispatch<SetStateAction<boolean>>;
  setReqPackageCount: Dispatch<SetStateAction<number>>;
};

type ImportedRequirement = RequirementData & {sourcePath: string};
type RequirementConflict = {
  id: string;
  existing: RequirementData;
  imported: ImportedRequirement;
};
type ConflictResolution = 'current' | 'imported' | 'both';

const reqFileFilters = [{name: 'Text', extensions: ['txt']}];

const normalizeReqName = (name: string) =>
  name
    .trim()
    .replace(/[-_.]+/g, '-')
    .toLowerCase();
const getBasename = (path: string) => path.split(/[\/\\]/).pop() || path;

const getRequirementKey = (req: RequirementData) => {
  const extras = req.extras?.length ? [...req.extras].sort().join(',').toLowerCase() : '';
  return [normalizeReqName(req.name), extras, req.markers?.trim().toLowerCase() || ''].join('|');
};

const getRequirementLabel = (req: RequirementData) => {
  if (req.url) return req.originalLine;
  const extras = req.extras?.length ? `[${req.extras.join(',')}]` : '';
  const version = req.version ? `${req.versionOperator || '=='}${req.version}` : '';
  const markers = req.markers ? `; ${req.markers}` : '';
  return `${req.name}${extras}${version}${markers}`;
};

const isSameRequirement = (a: RequirementData, b: RequirementData) =>
  getRequirementKey(a) === getRequirementKey(b) &&
  (a.versionOperator || null) === (b.versionOperator || null) &&
  (a.version || null) === (b.version || null) &&
  (a.url || null) === (b.url || null) &&
  (a.originalLine || '') === (b.originalLine || '');

const toImportedRequirement = (req: RequirementData, sourcePath: string): ImportedRequirement => {
  const {sourceLine, sourceLineRaw, ...importedReq} = req;
  return {...importedReq, sourcePath};
};

export default function RequirementsModal({id, projectPath, setIsReqAvailable, setReqPackageCount}: Props) {
  const state = useOverlayState();
  const scrollRef = useRef<OverlayScrollbarsComponentRef>(null);

  const [requirements, setRequirements] = useState<RequirementData[]>([]);
  const [filePath, setFilePath] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const [conflicts, setConflicts] = useState<RequirementConflict[]>([]);
  const requirementsRef = useRef<RequirementData[]>([]);

  const filteredReqs = useMemo(
    () => requirements.filter(item => searchInStrings(searchValue, [item.name])),
    [searchValue, requirements],
  );

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
      setConflicts([]);
    });

    setIsReqAvailable(!!filePath);
  }, [filePath]);

  useEffect(() => {
    setReqPackageCount(requirements.length);
  }, [requirements.length, setReqPackageCount]);

  useEffect(() => {
    requirementsRef.current = requirements;
  }, [requirements]);

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
      pIpc.saveReqs(filePath, requirements).then(success => {
        if (success) {
          toastHolder?.top.success('Requirements saved successfully!');
        } else {
          toastHolder?.top.danger('Failed to save requirements.');
        }
        setIsSaving(false);
      });
    }
  };

  const openFilePath = () => {
    filesIpc
      .openDlg({
        properties: ['openFile'],
        filters: reqFileFilters,
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
    setConflicts([]);
    pIpc.setReqPath({id, path: ''});
  };

  const handleImportRequirements = () => {
    filesIpc
      .openDlgMany({properties: ['openFile'], filters: reqFileFilters})
      .then(async files => {
        if (files.length === 0) return;

        setIsImporting(true);
        const importedFiles = await Promise.all(
          files.map(async path => ({path, requirements: await pIpc.readReqs(path)})),
        );
        let importedCount = 0;
        let skippedCount = 0;
        const nextConflicts: RequirementConflict[] = [];
        const merged = [...requirementsRef.current];

        importedFiles.forEach(({path, requirements: importedReqs}) => {
          importedReqs.forEach(req => {
            if (!req.name.trim()) return;
            importedCount += 1;

            const imported = toImportedRequirement(req, path);
            const existing = merged.find(item => getRequirementKey(item) === getRequirementKey(imported));

            if (!existing) {
              merged.push(imported);
              return;
            }

            if (isSameRequirement(existing, imported)) {
              skippedCount += 1;
              return;
            }

            nextConflicts.push({
              id: `${getRequirementKey(imported)}|${path}|${nextConflicts.length}`,
              existing,
              imported,
            });
          });
        });

        setRequirements(merged);
        setConflicts(prev => [...prev, ...nextConflicts]);
        setIsImporting(false);

        const addedCount = importedCount - skippedCount - nextConflicts.length;
        if (nextConflicts.length > 0) {
          toastHolder?.top.warning(
            `Imported ${addedCount} package${addedCount === 1 ? '' : 's'} with ${nextConflicts.length} conflict${
              nextConflicts.length === 1 ? '' : 's'
            } to resolve.`,
          );
        } else {
          toastHolder?.top.success(
            files.length === 1 ? 'Requirements file imported successfully' : 'Requirements files imported successfully',
          );
        }
      })
      .catch(() => {
        setIsImporting(false);
        toastHolder?.top.danger('Error importing requirements files');
      });
  };

  const applyConflictResolution = (conflict: RequirementConflict, resolution: ConflictResolution) => {
    setRequirements(prev => {
      if (resolution === 'current') return prev;
      if (resolution === 'both') return [...prev, conflict.imported];

      const key = getRequirementKey(conflict.existing);
      const existingIndex = prev.findIndex(item => getRequirementKey(item) === key);
      if (existingIndex === -1) return [...prev, conflict.imported];

      const next = [...prev];
      next[existingIndex] = conflict.imported;
      return next;
    });

    setConflicts(prev => prev.filter(item => item.id !== conflict.id));
  };

  const applyAllConflictResolutions = (resolution: ConflictResolution) => {
    conflicts.forEach(conflict => applyConflictResolution(conflict, resolution));
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
            <LynxTooltip delay={300} content="Deselect requirements file">
              <Button onPress={deselect} variant="tertiary" className="shrink-0" isIconOnly>
                <X />
              </Button>
            </LynxTooltip>
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
              <>
                <Button variant="secondary" isPending={isImporting} onPress={handleImportRequirements}>
                  {isImporting ? <Spinner size="sm" color="current" /> : <Import className="size-3.5" />}
                  Import
                </Button>
                <Button variant="secondary" onPress={handleAddRequirement}>
                  <Plus size={14} />
                  Add
                </Button>
              </>
            )}
          </div>
        </Modal.Header>
        <Modal.Body className="pr-0 pl-2 pt-4 scrollbar-hide">
          {!isEmpty(conflicts) && (
            <div className="mr-4 mb-4 rounded-2xl border border-warning/25 bg-warning/5 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-warning">
                  <ShieldWarning className="size-5" />
                  <span className="text-sm font-medium">
                    {conflicts.length} import conflict{conflicts.length === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Button size="sm" variant="tertiary" onPress={() => applyAllConflictResolutions('current')}>
                    Keep current
                  </Button>
                  <Button size="sm" variant="tertiary" onPress={() => applyAllConflictResolutions('imported')}>
                    Use imported
                  </Button>
                  <Button size="sm" variant="tertiary" onPress={() => applyAllConflictResolutions('both')}>
                    Keep both
                  </Button>
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {conflicts.map(conflict => (
                  <div key={conflict.id} className="rounded-xl bg-surface-secondary p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">{conflict.existing.name}</span>
                          <Chip size="sm" variant="soft" color="warning">
                            {getBasename(conflict.imported.sourcePath)}
                          </Chip>
                        </div>
                        <div className="mt-2 grid gap-1 text-xs">
                          <p className="break-all text-content-secondary">
                            Current:{' '}
                            <span className="font-JetBrainsMono text-content-primary">
                              {getRequirementLabel(conflict.existing)}
                            </span>
                          </p>
                          <p className="break-all text-content-secondary">
                            Imported:{' '}
                            <span className="font-JetBrainsMono text-content-primary">
                              {getRequirementLabel(conflict.imported)}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-1.5">
                        <Button
                          size="sm"
                          variant="tertiary"
                          onPress={() => applyConflictResolution(conflict, 'current')}>
                          Current
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onPress={() => applyConflictResolution(conflict, 'imported')}>
                          Imported
                        </Button>
                        <Button size="sm" variant="tertiary" onPress={() => applyConflictResolution(conflict, 'both')}>
                          Both
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            <RenderTable scrollRef={scrollRef} filteredReqs={filteredReqs} setRequirements={setRequirements} />
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
