import {Button, Spinner} from '@nextui-org/react';
import {Empty, message} from 'antd';
import {isEmpty} from 'lodash';
import {useCallback, useEffect, useState} from 'react';

import {pythonChannels, PythonInstallation, PythonVenvs, VenvInfo} from '../../../../cross/CrossExtensions';
import {bytesToMegabytes} from '../../../../cross/CrossUtils';
import rendererIpc from '../../../src/App/RendererIpc';
import {OpenFolder_Icon} from '../../../src/assets/icons/SvgIcons/SvgIcons4';
import PythonVenvCard from './PythonVenvCard';
import VenvCreator from './VenvCreator';

type Props = {
  visible: boolean;
  installedPythons: PythonInstallation[];
  isLoadingPythons: boolean;
};

export default function VenvPython({visible, installedPythons, isLoadingPythons}: Props) {
  const [pythonVenvs, setPythonVenvs] = useState<PythonVenvs[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [isLocating, setIsLocating] = useState<boolean>(false);

  const [diskUsage, setDiskUsage] = useState<{path: string; value: number | undefined}[]>([]);

  const getVenvs = useCallback(() => {
    setIsLoading(true);
    window.electron.ipcRenderer.invoke(pythonChannels.getVenvs).then((result: VenvInfo[]) => {
      setPythonVenvs(
        result.map(venv => {
          return {
            pythonVersion: venv.pythonVersion,
            pythonPath: venv.pythonPath,
            title: venv.name,
            installedPackages: venv.sitePackagesCount,
            folder: venv.folder,
          };
        }),
      );
      for (const venv of result) {
        rendererIpc.file.calcFolderSize(venv.folder).then(value => {
          if (value)
            setDiskUsage(prevState => [
              ...prevState,
              {
                path: venv.folder,
                value: bytesToMegabytes(value),
              },
            ]);
        });
      }
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
        <div className="gap-x-2 flex flex-row">
          <VenvCreator refresh={getVenvs} installedPythons={installedPythons} isLoadingPythons={isLoadingPythons} />

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
          <Spinner
            size="lg"
            label="Reading and validating venvs, please wait..."
            classNames={{circle2: 'border-b-[#ffe66e]', circle1: 'border-b-[#ffe66e] '}}
          />
        ) : isEmpty(pythonVenvs) ? (
          <Empty className="my-2" description="No Environments">
            To get started, create a new virtual environment or locate an existing one using the buttons above.
          </Empty>
        ) : (
          <>
            {pythonVenvs.map(venv => (
              <PythonVenvCard
                title={venv.title}
                folder={venv.folder}
                diskUsage={diskUsage}
                key={`${venv.title}_card`}
                pythonPath={venv.pythonPath}
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
