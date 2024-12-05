import {Button, CircularProgress} from '@nextui-org/react';
import {Empty, Tooltip} from 'antd';
import {isEmpty} from 'lodash';
import {useEffect, useState} from 'react';

import {PythonInstallation} from '../../../../cross/CrossExtensions';
import {bytesToMegabytes} from '../../../../cross/CrossUtils';
import rendererIpc from '../../../src/App/RendererIpc';
import {getIconByName} from '../../../src/assets/icons/SvgIconsContainer';
import InstalledCard from './InstalledCard';
import InstallerModal from './InstallerModal';

export default function InstalledPythons({visible}: {visible: boolean}) {
  const [pythons, setPythons] = useState<PythonInstallation[]>([]);
  const [loadingPythons, setLoadingPythons] = useState<boolean>(false);
  const [diskUsage, setDiskUsage] = useState<{path: string; value: number | undefined}[]>([]);
  const [maxDiskValue, setMaxDiskValue] = useState<number>(0);

  useEffect(() => {
    diskUsage.forEach(disk => {
      setMaxDiskValue(prevState => {
        const size = disk.value || 0;
        if (prevState >= size) {
          return prevState;
        } else {
          return size < 500 ? size + 500 : size + 1000;
        }
      });
    });
  }, [diskUsage]);

  const getInstalledPythons = () => {
    setLoadingPythons(true);
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
    getInstalledPythons();
  }, []);

  const [installModalOpen, setInstallModalOpen] = useState<boolean>(false);

  const openInstallModal = () => {
    setInstallModalOpen(true);
  };
  const closeInstallModal = () => {
    setInstallModalOpen(false);
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

  if (!visible) return null;

  return (
    <div className="w-full flex flex-col gap-y-4">
      <InstallerModal
        isOpen={installModalOpen}
        refresh={getInstalledPythons}
        closeModal={closeInstallModal}
        installed={pythons.map(item => item.version)}
      />
      <div className="w-full flex flex-row justify-between items-center">
        <span className="font-bold">Installed Versions</span>
        <div className="justify-center items-center flex gap-x-2">
          <Button radius="sm" variant="solid" onPress={openInstallModal} startContent={getIconByName('Add')}>
            Install New Version
          </Button>
          <Tooltip title="Refresh">
            <Button variant="faded" onPress={getInstalledPythons} startContent={getIconByName('Refresh')} isIconOnly />
          </Tooltip>
        </div>
      </div>
      <div className={`flex flex-row gap-8 flex-wrap ${(loadingPythons || isEmpty(pythons)) && 'justify-center'}`}>
        {loadingPythons ? (
          <CircularProgress
            size="lg"
            label="Searching for installed pythons..."
            classNames={{indicator: 'stroke-[#ffe66e]'}}
          />
        ) : isEmpty(pythons) ? (
          <Empty description="No Python installation detected." />
        ) : (
          pythons.map(python => (
            <InstalledCard
              python={python}
              diskUsage={diskUsage}
              key={python.installFolder}
              maxDiskValue={maxDiskValue}
              refresh={getInstalledPythons}
              updateDefault={updateDefault}
            />
          ))
        )}
      </div>
    </div>
  );
}
