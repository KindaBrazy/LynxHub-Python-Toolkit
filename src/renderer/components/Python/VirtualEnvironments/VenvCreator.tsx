import {Button, Input, Key, Label, ListBox, Popover, Select, TextField} from '@heroui-v3/react';
import {topToast} from '@lynx/layouts/ToastProviders';
import filesIpc from '@lynx_shared/ipc/files';
import {FolderOpen} from '@solar-icons/react-perf/BoldDuotone';
import {capitalize, isEmpty} from 'lodash-es';
import {Plus} from 'lucide-react';
import {useCallback, useEffect, useMemo, useState} from 'react';

import {PythonInstallation, VenvCreateOptions} from '../../../../cross/CrossExtTypes';
import pIpc from '../../../PIpc';

type Props = {refresh: () => void; installedPythons: PythonInstallation[]; isLoadingPythons: boolean};

export default function VenvCreator({installedPythons, refresh, isLoadingPythons}: Props) {
  const [selectedVersion, setSelectedVersion] = useState<Key | null>(null);

  const [targetFolder, setTargetFolder] = useState<string>('');
  const [envName, setEnvName] = useState<string>('');

  const [isCreating, setIsCreating] = useState<boolean>(false);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setTargetFolder('');
      setEnvName('');
    }
  }, [isOpen]);

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
      topToast.danger('Failed to find Python path. Please restart app and try again.');
      return;
    }
    const options: VenvCreateOptions = {
      destinationFolder: targetFolder,
      venvName: envName,
      pythonPath,
    };

    pIpc.createVenv(options).then(result => {
      if (result) {
        refresh();
        setIsOpen(false);
        topToast.success(`Python environment "${envName}" created successfully.`);
      } else {
        topToast.danger('Failed to create Python environment. Please try again.');
      }

      setIsCreating(false);
    });
  }, [targetFolder, envName, selectedVersion, installedPythons]);

  return (
    <Popover>
      <Button variant="secondary" isPending={isLoadingPythons} isDisabled={isEmpty(installedPythons)}>
        {!isLoadingPythons && <Plus size={14} />}
        {isLoadingPythons ? 'Loading Pythons...' : 'New Environment'}
      </Button>
      <Popover.Content>
        <Popover.Dialog>
          <Popover.Arrow />
          <Popover.Heading>Create New Virtual Environment</Popover.Heading>
          <div className="flex flex-col gap-y-4 py-2">
            <TextField type="text" value={envName} variant="secondary" onChange={setEnvName}>
              <Label>Environment Name</Label>
              <Input placeholder="e.g., my_env" />
            </TextField>
            <Select variant="secondary" value={selectedVersion} onChange={setSelectedVersion}>
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
            <Button size="sm" variant="secondary" onPress={selectFolder} fullWidth>
              <FolderOpen />
              {targetFolder || 'Choose Destination Folder'}
            </Button>
            <Button size="sm" onPress={createEnv} isPending={isCreating} isDisabled={disabledCreate} fullWidth>
              Create Environment
            </Button>
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
