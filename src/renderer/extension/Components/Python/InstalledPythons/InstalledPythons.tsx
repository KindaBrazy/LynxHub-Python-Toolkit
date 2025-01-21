import {Button, Spinner} from '@heroui/react';
import {Empty} from 'antd';
import {isEmpty} from 'lodash';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';

import {PythonInstallation} from '../../../../../cross/extension/CrossExtTypes';
import {bytesToMegabytes} from '../../../../../cross/extension/CrossExtUtils';
import rendererIpc from '../../../../src/App/RendererIpc';
import {Add_Icon} from '../../../../src/assets/icons/SvgIcons/SvgIcons1';
import {Refresh_Icon} from '../../../../src/assets/icons/SvgIcons/SvgIcons2';
import pIpc from '../../../PIpc';
import InstalledCard from './InstalledCard';
import InstallerModal from './Installer/InstallerModal';

type Props = {
  visible: boolean;
  installedPythons: PythonInstallation[];
  setInstalledPythons: Dispatch<SetStateAction<PythonInstallation[]>>;
  isLoadingPythons: boolean;
  setIsLoadingPythons: Dispatch<SetStateAction<boolean>>;
};
export default function InstalledPythons({
  visible,
  installedPythons,
  setInstalledPythons,
  setIsLoadingPythons,
  isLoadingPythons,
}: Props) {
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
    setIsLoadingPythons(true);
    pIpc.getInstalledPythons().then((result: PythonInstallation[]) => {
      setInstalledPythons(result);
      setIsLoadingPythons(false);

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
    setInstalledPythons(prevState =>
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
        installed={installedPythons.map(item => {
          const {version, installationType} = item;
          return {
            version,
            installationType,
          };
        })}
        isOpen={installModalOpen}
        refresh={getInstalledPythons}
        closeModal={closeInstallModal}
      />
      <div className="w-full flex flex-row justify-between items-center">
        <span className="font-bold">Installed Versions</span>
        <div className="justify-center items-center flex gap-x-2">
          <Button radius="sm" variant="solid" onPress={openInstallModal} startContent={<Add_Icon />}>
            Install Version
          </Button>
          <Button variant="faded" onPress={getInstalledPythons} startContent={<Refresh_Icon />}>
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
