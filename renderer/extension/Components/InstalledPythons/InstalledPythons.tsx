import {Button, CircularProgress} from '@nextui-org/react';
import {useEffect, useState} from 'react';

import {bytesToMegabytes} from '../../../../cross/CrossUtils';
import rendererIpc from '../../../src/App/RendererIpc';
import {getIconByName} from '../../../src/assets/icons/SvgIconsContainer';
import {PythonInstallation} from '../../Types';
import PythonInstalledCard from './PythonInstalledCard';

export default function InstalledPythons() {
  const [pythons, setPythons] = useState<PythonInstallation[]>([]);
  const [loadingPythons, setLoadingPythons] = useState<boolean>(false);
  const [diskUsage, setDiskUsage] = useState<{path: string; value: number | undefined}[]>([]);
  const [maxDiskValue, setMaxDiskValue] = useState<number>(0);

  useEffect(() => {
    console.log('', diskUsage);
    diskUsage.forEach(disk => {
      setMaxDiskValue(prevState => {
        if (prevState >= (disk.value || 0)) {
          return prevState;
        } else {
          return (disk.value || 0) + 1000;
        }
      });
    });
  }, [diskUsage]);

  useEffect(() => {
    setLoadingPythons(true);
    window.electron.ipcRenderer.invoke('get-pythons').then((result: PythonInstallation[]) => {
      console.log(result);
      setPythons(result);
      setLoadingPythons(false);

      for (const python of result) {
        rendererIpc.file.calcFolderSize(python.installFolder).then(value => {
          if (value)
            setDiskUsage(prevState => [
              ...prevState,
              {
                path: python.installFolder,
                value: bytesToMegabytes(value),
              },
            ]);
        });
      }
    });
  }, []);

  return (
    <div className="w-full flex flex-col gap-y-4">
      <div className="w-full flex flex-row justify-between items-center">
        <span className="font-bold">Installed Versions</span>
        <Button radius="sm" variant="solid" startContent={getIconByName('Add')}>
          Install New Version
        </Button>
      </div>
      <div className={`flex flex-row gap-8 flex-wrap ${loadingPythons && 'justify-center'}`}>
        {loadingPythons ? (
          <CircularProgress size="lg" label="Detecting pythons..." />
        ) : (
          pythons.map(python => (
            <PythonInstalledCard
              python={python}
              diskUsage={diskUsage}
              key={python.installFolder}
              maxDiskValue={maxDiskValue}
            />
          ))
        )}
      </div>
    </div>
  );
}
