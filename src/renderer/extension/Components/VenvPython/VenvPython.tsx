import {Button, CircularProgress} from '@nextui-org/react';
import {Empty, message} from 'antd';
import {isEmpty, random} from 'lodash';
import {useCallback, useEffect, useState} from 'react';

import {pythonChannels, PythonInstallation, PythonVenvs, VenvInfo} from '../../../../cross/CrossExtensions';
import {OpenFolder_Icon} from '../../../src/assets/icons/SvgIcons/SvgIcons4';
import PythonVenvCard from './PythonVenvCard';
import VenvCreator from './VenvCreator';

type Props = {visible: boolean; installedPythons: PythonInstallation[]};

export default function VenvPython({visible, installedPythons}: Props) {
  const [pythonVenvs, setPythonVenvs] = useState<PythonVenvs[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [isLocating, setIsLocating] = useState<boolean>(false);

  const getVenvs = useCallback(() => {
    setIsLoading(true);
    window.electron.ipcRenderer.invoke(pythonChannels.getVenvs).then((result: VenvInfo[]) => {
      setPythonVenvs(
        result.map(venv => {
          return {
            pythonVersion: venv.pythonVersion,
            title: venv.folderName,
            installedPackages: venv.sitePackagesCount,
            folder: venv.folder,
            size: random(1000),
          };
        }),
      );
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    getVenvs();
  }, []);

  const locateVenv = () => {
    setIsLocating(true);
    window.electron.ipcRenderer.invoke(pythonChannels.locateVenv).then((isLocated: boolean) => {
      if (isLocated) {
        message.success('Environment validated successfully.');
        getVenvs();
      } else {
        message.error('Somethings goes wrong when validating.');
      }
      setIsLocating(false);
    });
  };

  if (!visible) return null;

  return (
    <div className="w-full flex flex-col gap-y-4">
      <div className="w-full flex flex-row justify-between items-center">
        <span className="font-bold">Virtual Environments</span>
        <div className="space-x-2">
          <VenvCreator refresh={getVenvs} installedPythons={installedPythons} />

          <Button
            radius="sm"
            variant="faded"
            onPress={locateVenv}
            isLoading={isLocating}
            startContent={!isLocating && <OpenFolder_Icon />}>
            {!isLocating && 'Locate'}
          </Button>
        </div>
      </div>
      <div className="flex justify-center flex-row flex-wrap gap-8">
        {isLoading ? (
          <CircularProgress
            size="lg"
            classNames={{indicator: 'stroke-[#ffe66e]'}}
            label="Reading and validating venvs, please wait..."
          />
        ) : isEmpty(pythonVenvs) ? (
          <Empty className="my-2" description="No Environments">
            To get started, create a new virtual environment or locate an existing one using the buttons above.
          </Empty>
        ) : (
          <>
            {pythonVenvs.map(venv => (
              <PythonVenvCard
                size={venv.size}
                title={venv.title}
                folder={venv.folder}
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
