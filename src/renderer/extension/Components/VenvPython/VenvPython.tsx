import {Button} from '@nextui-org/react';
import {Empty} from 'antd';
import {isEmpty} from 'lodash';
import {useEffect, useState} from 'react';

import {PythonInstallation, PythonVenvs} from '../../../../cross/CrossExtensions';
import {OpenFolder_Icon} from '../../../src/assets/icons/SvgIcons/SvgIcons4';
import PythonVenvCard from './PythonVenvCard';
import VenvCreator from './VenvCreator';

type Props = {visible: boolean; installedPythons: PythonInstallation[]};

export default function VenvPython({visible, installedPythons}: Props) {
  const [pythonVenvs, setPythonVenvs] = useState<PythonVenvs[]>([]);

  useEffect(() => {
    setPythonVenvs([
      {
        size: 100,
        title: 'lynx-project',
        pythonVersion: '3.11.4',
        installedPackages: 12,
      },
      {
        size: 750,
        title: 'lynx-project 2',
        pythonVersion: '3.13.1',
        installedPackages: 52,
      },
    ]);
  }, []);

  const refresh = () => {
    // TODO: Refresh Venvs List
  };

  if (!visible) return null;

  return (
    <div className="w-full flex flex-col gap-y-4">
      <div className="w-full flex flex-row justify-between items-center">
        <span className="font-bold">Virtual Environments</span>
        <div className="space-x-2">
          <VenvCreator refresh={refresh} installedPythons={installedPythons} />

          <Button radius="sm" variant="faded" startContent={<OpenFolder_Icon />}>
            Locate
          </Button>
        </div>
      </div>
      <div className="flex justify-center flex-row flex-wrap gap-8">
        {isEmpty(pythonVenvs) ? (
          <Empty className="my-2" description="No Environments">
            To get started, create a new virtual environment or locate an existing one using the buttons above.
          </Empty>
        ) : (
          <>
            {pythonVenvs.map(venv => (
              <PythonVenvCard
                size={venv.size}
                title={venv.title}
                key={`${venv.title}_card`}
                pythonVersion={venv.pythonVersion}
                installedPackages={venv.installedPackages}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
