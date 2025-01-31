import {Button, Spinner} from '@heroui/react';
import {Empty, message} from 'antd';
import {isEmpty} from 'lodash';
import {useCallback, useEffect, useState} from 'react';

import {PythonInstallation, PythonVenvs, VenvInfo} from '../../../../../cross/extension/CrossExtTypes';
import {bytesToMegabytes} from '../../../../../cross/extension/CrossExtUtils';
import rendererIpc from '../../../../src/App/RendererIpc';
import {OpenFolder_Icon} from '../../../../src/assets/icons/SvgIcons/SvgIcons4';
import pIpc from '../../../PIpc';
import VenvCard from './VenvCard';
import VenvCreator from './VenvCreator';

type Props = {
  visible: boolean;
  installedPythons: PythonInstallation[];
  isLoadingPythons: boolean;
};

export default function Venv({visible, installedPythons, isLoadingPythons}: Props) {
  const [pythonVenvs, setPythonVenvs] = useState<PythonVenvs[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isLocating, setIsLocating] = useState<boolean>(false);

  const [diskUsage, setDiskUsage] = useState<{path: string; value: number | undefined}[]>([]);

  const getVenvs = useCallback(() => {
    setIsLoading(true);
    const condaVenvs = installedPythons.filter(pt => pt.installationType === 'conda');
    pIpc.getVenvs().then((venvs: VenvInfo[]) => {
      const resultVenvs: VenvInfo[] = [
        ...venvs,
        ...condaVenvs.map(venv => {
          return {
            pythonVersion: venv.version,
            pythonPath: venv.installPath,
            folder: venv.installFolder,
            sitePackagesCount: venv.packages,
            name: venv.condaName,
          };
        }),
      ];
      setPythonVenvs(
        resultVenvs.map(venv => {
          return {
            pythonVersion: venv.pythonVersion,
            pythonPath: venv.pythonPath,
            title: venv.name,
            installedPackages: venv.sitePackagesCount,
            folder: venv.folder,
          };
        }),
      );
      for (const venv of resultVenvs) {
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
  }, [installedPythons]);

  useEffect(() => {
    if (!isEmpty(installedPythons)) getVenvs();
  }, [installedPythons]);

  const locateVenv = () => {
    setIsLocating(true);
    pIpc.locateVenv().then((isLocated: boolean) => {
      if (isLocated) {
        message.success('Environment validated successfully.');
        getVenvs();
      } else {
        message.error('Failed to validate environment.');
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
          <Empty className="my-2" description="No Environments Yet">
            Create a new environment or locate an existing one to get started.
          </Empty>
        ) : (
          <>
            {pythonVenvs.map((venv, index) => (
              <VenvCard
                refresh={getVenvs}
                title={venv.title}
                folder={venv.folder}
                diskUsage={diskUsage}
                pythonPath={venv.pythonPath}
                pythonVersion={venv.pythonVersion}
                key={`${venv.title}_${index}_card`}
                installedPackages={venv.installedPackages}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
