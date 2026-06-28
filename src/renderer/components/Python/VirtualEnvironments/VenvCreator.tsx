import {Button, Checkbox, Input, Key, Label, ListBox, Popover, Select, Spinner, TextField} from '@heroui/react';
import filesIpc from '@lynx_shared/ipc/files';
import {FolderOpen} from '@solar-icons/react-perf/BoldDuotone';
import {capitalize, isEmpty} from 'lodash-es';
import {Plus} from 'lucide-react';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {parse} from 'semver';

import {PythonInstallation, VenvCreateOptions} from '../../../../cross/CrossExtTypes';
import {toastHolder} from '../../../DataHolder';
import pIpc from '../../../PIpc';

type Props = {refresh: () => void; installedPythons: PythonInstallation[]; isLoadingPythons: boolean};

export default function VenvCreator({installedPythons, refresh, isLoadingPythons}: Props) {
  const [selectedVersion, setSelectedVersion] = useState<Key | null>(null);

  const [targetFolder, setTargetFolder] = useState<string>('');
  const [envName, setEnvName] = useState<string>('');

  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [updatePip, setUpdatePip] = useState<boolean>(true);
  const [showUpgrade, setShowUpgrade] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setTargetFolder('');
      setEnvName('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedVersion && typeof selectedVersion !== 'number') {
      const version = parse(selectedVersion);
      if (version && version.major >= 3 && version.minor >= 9) setShowUpgrade(true);
    }
  }, [selectedVersion]);

  const disabledCreate = useMemo(() => {
    return isEmpty(targetFolder) || isEmpty(envName) || isEmpty(selectedVersion);
  }, [targetFolder, envName, selectedVersion]);

  const selectFolder = useCallback(() => {
    filesIpc.openDlg({properties: ['openDirectory']}).then(folder => {
      setTargetFolder(folder || '');
    });
  }, []);

  useEffect(() => {
    if (!isEmpty(installedPythons)) setSelectedVersion(installedPythons[0].version);
  }, [installedPythons]);

  const createEnv = useCallback(() => {
    setIsCreating(true);
    const pythonPath = installedPythons.find(item => item.version === selectedVersion)?.installPath;
    if (!pythonPath) {
      setIsCreating(false);
      toastHolder?.top.danger('Failed to find Python path. Please restart app and try again.');
      return;
    }
    const options: VenvCreateOptions = {
      destinationFolder: targetFolder,
      venvName: envName,
      pythonPath,
      upgradeDeps: updatePip,
    };

    pIpc.createVenv(options).then(result => {
      if (result) {
        refresh();
        setIsOpen(false);
        toastHolder?.top.success(`Python environment "${envName}" created successfully.`);
      } else {
        toastHolder?.top.danger('Failed to create Python environment. Please try again.');
      }

      setIsCreating(false);
    });
  }, [targetFolder, envName, selectedVersion, installedPythons, updatePip]);

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
      <Button variant="secondary" isPending={isLoadingPythons} isDisabled={isEmpty(installedPythons)}>
        {!isLoadingPythons && <Plus size={14} />}
        {isLoadingPythons ? 'Loading Pythons...' : 'New Environment'}
      </Button>
      <Popover.Content>
        <Popover.Dialog className="w-75">
          <Popover.Arrow />
          <Popover.Heading className="mb-2">Create New Virtual Environment</Popover.Heading>
          <div className="flex flex-col gap-y-4 py-2">
            <TextField
              type="text"
              value={envName}
              variant="secondary"
              onChange={setEnvName}
              isDisabled={isCreating}
              autoFocus>
              <Label>Environment Name</Label>
              <Input placeholder="e.g., my_env" />
            </TextField>

            <Select variant="secondary" isDisabled={isCreating} value={selectedVersion} onChange={setSelectedVersion}>
              <Label>Python Version</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox items={installedPythons}>
                  {item => (
                    <ListBox.Item
                      id={item.version}
                      key={item.version}
                      textValue={`${item.version} | ${capitalize(item.installationType)}`}>
                      {`${item.version} | ${capitalize(item.installationType)}` +
                        ` ${item.installationType === 'conda' ? `| ${item.condaName}` : ''}`}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  )}
                </ListBox>
              </Select.Popover>
            </Select>

            {showUpgrade && (
              <Checkbox variant="secondary" isSelected={updatePip} isDisabled={isCreating} onChange={setUpdatePip}>
                <Checkbox.Content>
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  Upgrade core packages
                </Checkbox.Content>
              </Checkbox>
            )}

            <div className="flex flex-col gap-y-2">
              <Button variant="secondary" isPending={isCreating} onPress={selectFolder} fullWidth>
                <FolderOpen />
                {targetFolder || 'Choose Destination Folder'}
              </Button>

              <Button onPress={createEnv} isPending={isCreating} isDisabled={disabledCreate} fullWidth>
                {isCreating && <Spinner size="sm" color="current" />}
                Create Environment
              </Button>
            </div>
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
