import {Button, CircularProgress} from '@nextui-org/react';
import {Empty} from 'antd';
import {isEmpty} from 'lodash';
import {useEffect, useState} from 'react';

import {PythonInstallation} from '../../../../cross/CrossExtensions';
import {bytesToMegabytes} from '../../../../cross/CrossUtils';
import rendererIpc from '../../../src/App/RendererIpc';
import {getIconByName} from '../../../src/assets/icons/SvgIconsContainer';
import InstallNewPythonModal from './InstallNewPythonModal';
import PythonInstalledCard from './PythonInstalledCard';

export default function InstalledPythons() {
  const [pythons, setPythons] = useState<PythonInstallation[]>([]);
  const [loadingPythons, setLoadingPythons] = useState<boolean>(false);
  const [diskUsage, setDiskUsage] = useState<{path: string; value: number | undefined}[]>([]);
  const [maxDiskValue, setMaxDiskValue] = useState<number>(0);

  useEffect(() => {
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

  const getInstalledPythons = () => {
    window.electron.ipcRenderer.invoke('get-pythons').then((result: PythonInstallation[]) => {
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
  };

  useEffect(() => {
    setLoadingPythons(true);
    getInstalledPythons();
  }, []);

  const [installModalOpen, setInstallModalOpen] = useState<boolean>(false);

  const openInstallModal = () => {
    setInstallModalOpen(true);
  };
  const closeInstallModal = () => {
    setInstallModalOpen(false);
  };

  const refresh = () => {
    getInstalledPythons();
  };

  const updateDefault = (installFolder: string) => {
    setPythons(prevState =>
      prevState.map(python => {
        if (python.installFolder === installFolder) {
          python.isDefault = true;
          return python;
        } else {
          python.isDefault = false;
          return python;
        }
      }),
    );
  };

  return (
    <div className="w-full flex flex-col gap-y-4">
      <InstallNewPythonModal isOpen={installModalOpen} closeModal={closeInstallModal} />
      <div className="w-full flex flex-row justify-between items-center">
        <span className="font-bold">Installed Versions</span>
        <Button radius="sm" variant="solid" onPress={openInstallModal} startContent={getIconByName('Add')}>
          Install New Version
        </Button>
      </div>
      <div className={`flex flex-row gap-8 flex-wrap ${(loadingPythons || isEmpty(pythons)) && 'justify-center'}`}>
        {loadingPythons ? (
          <CircularProgress size="lg" label="Detecting pythons..." classNames={{indicator: 'stroke-[#ffe66e]'}} />
        ) : isEmpty(pythons) ? (
          <Empty description="No Python installation detected." />
        ) : (
          pythons.map(python => (
            <PythonInstalledCard
              python={python}
              refresh={refresh}
              diskUsage={diskUsage}
              key={python.installFolder}
              maxDiskValue={maxDiskValue}
              updateDefault={updateDefault}
            />
          ))
        )}
      </div>
    </div>
  );
}
