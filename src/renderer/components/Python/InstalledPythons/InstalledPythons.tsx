import {Button, Description, Spinner, useOverlayState} from '@heroui-v3/react';
import EmptyStateCard from '@lynx/components/EmptyStateCard';
import {topToast} from '@lynx/layouts/ToastProviders';
import filesIpc from '@lynx_shared/ipc/files';
import {FolderOpen, Refresh} from '@solar-icons/react-perf/BoldDuotone';
import {cloneDeep, isEmpty} from 'lodash-es';
import {Plus} from 'lucide-react';
import {Dispatch, SetStateAction, useCallback, useEffect, useState} from 'react';

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
};
export default function InstalledPythons({
  visible,
  installedPythons,
  setInstalledPythons,
  setIsLoadingPythons,
  isLoadingPythons,
}: Props) {
  const [isLocating, setIsLocating] = useState<boolean>(false);

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
      filesIpc.calcFolderSize(python.sitePackagesPath).then((value: number) => {
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

  const installModal = useOverlayState();

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
    filesIpc
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
                topToast.success('Selected Python validated successfully.');
                getInstalledPythons(false);
              } else {
                topToast.danger('Failed to validate selected python.');
              }
              setIsLocating(false);
            })
            .catch(e => {
              console.warn(e);
              topToast.success('Failed to validate selected python.');
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
        state={installModal}
        refresh={getInstalledPythons}
      />
      <div className="w-full flex flex-row justify-between items-center">
        <span className="font-bold">Installed Versions</span>
        <div className="justify-center items-center flex gap-x-2">
          <Button variant="secondary" onPress={installModal.open}>
            <Plus />
            Install Version
          </Button>
          <Button variant="tertiary" onPress={locateVenv} isPending={isLocating}>
            {!isLocating && <FolderOpen />}
            {!isLocating && 'Locate'}
          </Button>
          <Button variant="tertiary" onPress={() => getInstalledPythons(true)}>
            <Refresh />
            Refresh List
          </Button>
        </div>
      </div>
      <div
        className={
          `flex flex-row flex-wrap gap-4 ` + `${(isLoadingPythons || isEmpty(installedPythons)) && 'justify-center'}`
        }>
        {isLoadingPythons ? (
          <div className="flex flex-col gap-y-2 items-center">
            <Spinner size="lg" />
            <Description className="text-sm">Loading python installations...</Description>
          </div>
        ) : isEmpty(installedPythons) ? (
          <EmptyStateCard title={`No Python installations found. Use the "Install Version" button to add one.`} />
        ) : (
          installedPythons.map(python => (
            <InstalledCard
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
