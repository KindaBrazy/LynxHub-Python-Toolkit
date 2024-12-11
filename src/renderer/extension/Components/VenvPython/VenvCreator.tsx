import {Button, Divider, Input, Popover, PopoverContent, PopoverTrigger, Select, SelectItem} from '@nextui-org/react';
import {message} from 'antd';
import {capitalize, isEmpty} from 'lodash';
import {useCallback, useEffect, useMemo, useState} from 'react';

import {pythonChannels, PythonInstallation, VenvCreateOptions} from '../../../../cross/CrossExtensions';
import rendererIpc from '../../../src/App/RendererIpc';
import {Add_Icon} from '../../../src/assets/icons/SvgIcons/SvgIcons1';
import {MenuDots_Icon} from '../../../src/assets/icons/SvgIcons/SvgIcons2';
import {OpenFolder_Icon} from '../../../src/assets/icons/SvgIcons/SvgIcons4';

type Props = {refresh: () => void; installedPythons: PythonInstallation[]};

export default function VenvCreator({installedPythons, refresh}: Props) {
  const [selectedVersion, setSelectedVersion] = useState<string[]>([]);

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
    rendererIpc.file.openDlg('openDirectory').then(folder => {
      setTargetFolder(folder || '');
    });
  }, []);

  useEffect(() => {
    if (!isEmpty(installedPythons)) setSelectedVersion([installedPythons[0].version]);
  }, [installedPythons]);

  const createEnv = useCallback(() => {
    setIsCreating(true);
    const pythonPath = installedPythons.find(item => item.version === selectedVersion[0])?.installPath;
    if (!pythonPath) {
      setIsCreating(false);
      return;
    }
    const options: VenvCreateOptions = {
      destinationFolder: targetFolder,
      venvName: envName,
      pythonPath,
    };
    window.electron.ipcRenderer.invoke(pythonChannels.createVenv, options).then(result => {
      if (result) {
        refresh();
        setIsOpen(false);
        message.success('Environment Created successfully');
      } else {
        message.warning('Something goes wrong to create environment');
      }

      setIsCreating(false);
    });
  }, [targetFolder, envName, selectedVersion]);

  return (
    <Popover size="lg" isOpen={isOpen} placement="bottom" onOpenChange={setIsOpen} showArrow>
      <PopoverTrigger>
        <Button radius="sm" variant="solid" startContent={<Add_Icon />} isDisabled={isEmpty(installedPythons)}>
          Create Environments
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        {titleProps => (
          <div className="pt-4 pb-2 px-2">
            <p className="font-bold" {...titleProps}>
              Virtual Environment Creation
            </p>
            <div className="flex flex-col gap-y-4 py-2">
              <Divider />
              <Input
                size="sm"
                value={envName}
                spellCheck={false}
                label="Environment Name"
                onValueChange={setEnvName}
                placeholder="Enter env name..."
              />
              <Select
                size="sm"
                variant="faded"
                label="Python Version"
                selectionMode="single"
                items={installedPythons}
                selectedKeys={selectedVersion}
                // @ts-ignore-next-line
                onSelectionChange={setSelectedVersion}
                placeholder="Select python version...">
                {item => (
                  <SelectItem key={item.version}>
                    {`${item.version} | ${capitalize(item.installationType)}` +
                      ` ${item.installationType === 'conda' ? `| ${item.condaName}` : ''}`}
                  </SelectItem>
                )}
              </Select>
              <Button
                size="sm"
                variant="faded"
                onPress={selectFolder}
                className="justify-between"
                endContent={<MenuDots_Icon />}
                startContent={<OpenFolder_Icon />}>
                {targetFolder || 'Select destination folder'}
              </Button>
              <Divider />
              <Button
                size="sm"
                variant="flat"
                color="success"
                onPress={createEnv}
                isLoading={isCreating}
                isDisabled={disabledCreate}>
                Create
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
