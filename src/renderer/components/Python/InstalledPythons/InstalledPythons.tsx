import {Button, Spinner} from '@heroui/react';
import {Empty} from 'antd';
import {cloneDeep, isEmpty} from 'lodash';
import {Dispatch, SetStateAction, useCallback, useEffect, useState} from 'react';

import rendererIpc from '../../../../../../src/renderer/src/App/RendererIpc';
import {Add_Icon, Refresh_Icon} from '../../../../../../src/renderer/src/assets/icons/SvgIcons/SvgIcons';
import {getDiskUsageID} from '../../../../cross/CrossExtConstants';
import {PythonInstallation} from '../../../../cross/CrossExtTypes';
import {bytesToMegabytes} from '../../../../cross/CrossExtUtils';
import pIpc from '../../../PIpc';
import {usePythonToolkitState} from '../../../reducer';
import InstalledCard from './InstalledCard';
import InstallerModal from './Installer/InstallerModal';

type Props = {
  visible: boolean;
  installedPythons: PythonInstallation[];
  setInstalledPythons: Dispatch<SetStateAction<PythonInstallation[]>>;
  isLoadingPythons: boolean;
  setIsLoadingPythons: Dispatch<SetStateAction<boolean>>;
  show: string;
};
export default function InstalledPythons({
  visible,
  installedPythons,
  setInstalledPythons,
  setIsLoadingPythons,
  isLoadingPythons,
  show,
}: Props) {
  const cacheStorageUsage = usePythonToolkitState('cacheStorageUsage');
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

  const calcDiskUsage = useCallback(
    (python: PythonInstallation) => {
      rendererIpc.file.calcFolderSize(python.sitePackagesPath).then((value: number) => {
        if (value) {
          window.localStorage.setItem(getDiskUsageID(python.installFolder), JSON.stringify(bytesToMegabytes(value)));
          setDiskUsage(prevState => [
            ...prevState,
            {
              path: python.installFolder,
              value: bytesToMegabytes(value),
            },
          ]);
        }
      });
    },
    [setDiskUsage],
  );

  const getInstalledPythons = (refresh: boolean) => {
    setIsLoadingPythons(true);
    pIpc.getInstalledPythons(refresh).then((result: PythonInstallation[]) => {
      setInstalledPythons(result);
      setIsLoadingPythons(false);

      for (const python of result) {
        if (cacheStorageUsage) {
          const cachedUsage = window.localStorage.getItem(getDiskUsageID(python.installFolder));
          if (!cachedUsage) {
            calcDiskUsage(python);
          } else {
            setDiskUsage(prevState => [
              ...prevState,
              {
                path: python.installFolder,
                value: JSON.parse(cachedUsage) as number,
              },
            ]);
          }
        } else {
          calcDiskUsage(python);
        }
      }
    });
  };

  useEffect(() => {
    getInstalledPythons(false);
  }, []);

  const [installModalOpen, setInstallModalOpen] = useState<boolean>(false);

  const openInstallModal = () => {
    setInstallModalOpen(true);
  };
  const closeInstallModal = () => {
    setInstallModalOpen(false);
  };

  const updateDefault = (installFolder: string, type: 'isDefault' | 'isLynxHubDefault') => {
    setInstalledPythons(prevState =>
      cloneDeep(
        prevState.map(python => {
          if (python.installFolder === installFolder) {
            python[type] = true;
            return python;
          } else {
            python[type] = false;
            return python;
          }
        }),
      ),
    );
  };

  if (!visible) return null;

  return (
    <div className="w-full flex flex-col gap-y-4">
      <InstallerModal
        installed={installedPythons.map(item => {
          const {version, installationType} = item;
          return {
            version,
            installationType,
          };
        })}
        show={show}
        isOpen={installModalOpen}
        refresh={getInstalledPythons}
        closeModal={closeInstallModal}
      />
      <div className="w-full flex flex-row justify-between items-center">
        <span className="font-bold">Installed Versions</span>
        <div className="justify-center items-center flex gap-x-2">
          <Button variant="solid" onPress={openInstallModal} startContent={<Add_Icon />}>
            Install Version
          </Button>
          <Button variant="flat" startContent={<Refresh_Icon />} onPress={() => getInstalledPythons(true)}>
            Refresh List
          </Button>
        </div>
      </div>
      <div
        className={
          `flex flex-row flex-wrap gap-8 ` + `${(isLoadingPythons || isEmpty(installedPythons)) && 'justify-center'}`
        }>
        {isLoadingPythons ? (
          <Spinner
            size="lg"
            label="Loading Python installations..."
            classNames={{circle2: 'border-b-[#ffe66e]', circle1: 'border-b-[#ffe66e] '}}
          />
        ) : isEmpty(installedPythons) ? (
          <Empty description={`No Python installations found. Use the "Install Version" button to add one.`} />
        ) : (
          installedPythons.map(python => (
            <InstalledCard
              show={show}
              python={python}
              diskUsage={diskUsage}
              maxDiskValue={maxDiskValue}
              refresh={getInstalledPythons}
              updateDefault={updateDefault}
              key={`${python.installationType}-${python.version}`}
            />
          ))
        )}
      </div>
    </div>
  );
}
