import {Button, Spinner} from '@heroui/react';
import {Empty} from 'antd';
import {cloneDeep, isEmpty} from 'lodash';
import {Dispatch, SetStateAction, useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import rendererIpc from '../../../../../../src/renderer/src/App/RendererIpc';
import {lynxTopToast} from '../../../../../../src/renderer/src/App/Utils/UtilHooks';
import {
  Add_Icon,
  FolderDuo_Icon,
  RefreshDuo_Icon,
} from '../../../../../../src/renderer/src/assets/icons/SvgIcons/SvgIcons';
import {PythonInstallation} from '../../../../cross/CrossExtTypes';
import {bytesToMegabytes} from '../../../../cross/CrossExtUtils';
import {rIpc} from '../../../DataHolder';
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
  const [isLocating, setIsLocating] = useState<boolean>(false);

  const dispatch = useDispatch();
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
          pIpc.storage.setCachedUsage(python.installFolder, bytesToMegabytes(value));
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
          pIpc.storage.getCachedUsage(python.installFolder).then(cachedUsage => {
            if (!cachedUsage) {
              calcDiskUsage(python);
            } else {
              setDiskUsage(prevState => [
                ...prevState,
                {
                  path: python.installFolder,
                  value: cachedUsage,
                },
              ]);
            }
          });
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

  const locateVenv = () => {
    setIsLocating(true);
    // Windows: filter for .exe files; macOS/Linux: use wildcard since executables have no extension
    rIpc.file
      .openDlg({
        properties: ['openFile'],
        filters: [{name: 'Executable Python', extensions: [window.osPlatform === 'win32' ? 'exe' : '*']}],
      })
      .then(pPath => {
        if (pPath) {
          pIpc
            .locatePython(pPath)
            .then(installation => {
              if (installation) {
                lynxTopToast(dispatch).success('Selected Python validated successfully.');
                getInstalledPythons(false);
              } else {
                lynxTopToast(dispatch).error('Failed to validate selected python.');
              }
              setIsLocating(false);
            })
            .catch(e => {
              console.warn(e);
              lynxTopToast(dispatch).success('Failed to validate selected python.');
              setIsLocating(false);
            });
        } else {
          setIsLocating(false);
        }
      })
      .catch(e => {
        console.warn(e);
        setIsLocating(false);
      });
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
          <Button
            variant="flat"
            onPress={locateVenv}
            isLoading={isLocating}
            startContent={!isLocating && <FolderDuo_Icon />}>
            {!isLocating && 'Locate'}
          </Button>
          <Button variant="flat" startContent={<RefreshDuo_Icon />} onPress={() => getInstalledPythons(true)}>
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
