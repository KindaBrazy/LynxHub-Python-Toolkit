import {Button, Divider, Input, Popover, PopoverContent, PopoverTrigger, Select, SelectItem} from '@heroui/react';
import {message} from 'antd';
import {capitalize, isEmpty} from 'lodash';
import {useCallback, useEffect, useMemo, useState} from 'react';

import rendererIpc from '../../../../../../src/renderer/src/App/RendererIpc';
import {Add_Icon} from '../../../../../../src/renderer/src/assets/icons/SvgIcons/SvgIcons1';
import {MenuDots_Icon} from '../../../../../../src/renderer/src/assets/icons/SvgIcons/SvgIcons2';
import {OpenFolder_Icon} from '../../../../../../src/renderer/src/assets/icons/SvgIcons/SvgIcons4';
import {PythonInstallation, VenvCreateOptions} from '../../../../cross/CrossExtTypes';
import pIpc from '../../../PIpc';

type Props = {refresh: () => void; installedPythons: PythonInstallation[]; isLoadingPythons: boolean};

export default function VenvCreator({installedPythons, refresh, isLoadingPythons}: Props) {
  const [selectedVersion, setSelectedVersion] = useState<Set<string>>(new Set(['']));

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
    rendererIpc.file.openDlg({properties: ['openDirectory']}).then(folder => {
      setTargetFolder(folder || '');
    });
  }, []);

  useEffect(() => {
    if (!isEmpty(installedPythons)) setSelectedVersion(new Set([installedPythons[0].version]));
  }, [installedPythons]);

  const createEnv = useCallback(() => {
    setIsCreating(true);
    const pythonPath = installedPythons.find(
      item => item.version === selectedVersion.values().next().value,
    )?.installPath;
    if (!pythonPath) {
      setIsCreating(false);
      message.error('Failed to find Python path. Please restart app and try again.');
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
        message.success(`Python environment "${envName}" created successfully.`);
      } else {
        message.error('Failed to create Python environment. Please try again.');
      }

      setIsCreating(false);
    });
  }, [targetFolder, envName, selectedVersion, installedPythons]);

  return (
    <Popover size="lg" isOpen={isOpen} placement="bottom" onOpenChange={setIsOpen} showArrow>
      <PopoverTrigger>
        <Button
          radius="sm"
          variant="solid"
          isLoading={isLoadingPythons}
          isDisabled={isEmpty(installedPythons)}
          startContent={!isLoadingPythons && <Add_Icon />}>
          {isLoadingPythons ? 'Loading Pythons...' : 'New Environment'}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        {titleProps => (
          <div className="pt-4 pb-2 px-2">
            <p className="font-bold" {...titleProps}>
              Create New Virtual Environment
            </p>
            <div className="flex flex-col gap-y-4 py-2">
              <Divider />
              <Input
                size="sm"
                value={envName}
                spellCheck="false"
                label="Environment Name"
                onValueChange={setEnvName}
                placeholder="e.g., my_env"
              />
              <Select
                size="sm"
                variant="faded"
                label="Python Version"
                selectionMode="single"
                items={installedPythons}
                selectedKeys={selectedVersion}
                placeholder="Choose a version..."
                // @ts-ignore-next-line
                onSelectionChange={setSelectedVersion}>
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
                {targetFolder || 'Choose Destination Folder'}
              </Button>
              <Divider />
              <Button
                size="sm"
                variant="flat"
                color="success"
                onPress={createEnv}
                isLoading={isCreating}
                isDisabled={disabledCreate}>
                Create Environment
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
