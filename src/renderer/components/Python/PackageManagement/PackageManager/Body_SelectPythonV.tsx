import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from '@heroui/react';
import {capitalize} from 'lodash';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';

import {PythonInstallation} from '../../../../../cross/CrossExtTypes';
import pIpc from '../../../../PIpc';

type Props = {id: string; setPythonPath?: Dispatch<SetStateAction<string>>};

export default function Body_SelectPythonV({id, setPythonPath}: Props) {
  const [installedPythons, setInstalledPythons] = useState<PythonInstallation[]>([]);

  const handleSelectVersion = (python: PythonInstallation) => {
    pIpc.addAIVenv(id, python.installPath);
    setPythonPath?.(python.installPath);
  };

  useEffect(() => {
    pIpc.getInstalledPythons(false).then((result: PythonInstallation[]) => {
      setInstalledPythons(result);
    });
  }, []);

  return (
    <Dropdown size="sm" showArrow>
      <DropdownTrigger>
        <Button color="secondary" key="select_python_version">
          Select Python Version
        </Button>
      </DropdownTrigger>
      <DropdownMenu>
        {installedPythons.map(p => (
          <DropdownItem
            key={p.version}
            onPress={() => handleSelectVersion(p)}
            variant={p.isDefault ? 'flat' : 'solid'}
            color={p.isDefault ? 'secondary' : 'default'}>
            <div className="flex flex-row gap-x-1 items-end">
              <span className="font-bold">{p.version}</span>
              <span className="text-foreground-500 font-semibold text-xs">{capitalize(p.installationType)}</span>
              {p.isDefault && <span className="text-xs font-bold text-secondary">System Default</span>}
            </div>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
