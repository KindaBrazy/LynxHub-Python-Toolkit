import {Button, Chip, Progress} from '@nextui-org/react';
import {Card, Spin} from 'antd';
import {isNil, startCase} from 'lodash';
import {useMemo, useState} from 'react';

import {PythonInstallation, UninstallResult} from '../../../../cross/CrossExtensions';
import {formatSizeMB} from '../../../../cross/CrossUtils';
import rendererIpc from '../../../src/App/RendererIpc';
import {getIconByName} from '../../../src/assets/icons/SvgIconsContainer';

type Props = {
  python: PythonInstallation;
  diskUsage: {path: string; value: number | undefined}[];
  maxDiskValue: number;
  updateDefault: (installFolder: string) => void;
  refresh: () => void;
};
export default function InstalledCard({python, diskUsage, maxDiskValue, updateDefault, refresh}: Props) {
  const size = useMemo(() => {
    return diskUsage.find(usage => usage.path === python.installFolder)?.value;
  }, [diskUsage]);

  const [isUninstalling, setIsUninstalling] = useState<boolean>(false);

  const makeDefault = () => {
    window.electron.ipcRenderer
      .invoke('set-default-python', python.installFolder)
      .then(() => {
        updateDefault(python.installFolder);
        console.log('deafult set');
      })
      .catch(error => {
        console.error(error);
      });
  };

  const uninstall = () => {
    setIsUninstalling(true);
    window.electron.ipcRenderer
      .invoke('uninstall-python', python.installPath)
      .then((result: UninstallResult) => {
        console.log(result);
      })
      .finally(() => {
        refresh();
        setIsUninstalling(false);
      });
  };

  const openPath = () => {
    rendererIpc.file.openPath(python.installFolder);
  };

  const installTypeColor = useMemo(() => {
    switch (python.installationType) {
      case 'official':
        return 'text-[#28A745]';
      case 'conda':
        return 'text-[#007BFF]';
      case 'other':
        return 'text-[#FFA500FFA500]';
    }
  }, [python.installationType]);

  return (
    <div className="relative">
      {isUninstalling && (
        <div className="absolute size-full bg-black/50 z-10 content-center text-center">
          <Spin className="absolute" tip="Uninstalling python, please wait..." />
        </div>
      )}
      <Card
        className={
          `w-[27rem] transition-colors duration-300 shadow-small` +
          ` ${
            python.isDefault
              ? 'border-secondary border-opacity-60 hover:border-opacity-100'
              : 'dark:hover:border-white/20 hover:border-black/20 '
          }`
        }
        title={
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-col my-3">
              <span>
                Python {python.version}
                {python.isDefault && (
                  <Chip
                    size="sm"
                    radius="sm"
                    variant="light"
                    color="secondary"
                    classNames={{content: '!font-semibold'}}>
                    Default
                  </Chip>
                )}
              </span>
              <div>
                <span className="text-tiny text-foreground-500">{python.architecture}</span>
                <span className={'text-tiny ml-2 ' + installTypeColor}>{startCase(python.installationType)}</span>
              </div>
            </div>
            <div className="space-x-2 flex items-center">
              {!python.isDefault && (
                <Button size="sm" variant="light" onPress={makeDefault}>
                  Set as Default
                </Button>
              )}
              <Button size="sm" color="danger" variant="light" onPress={uninstall} isIconOnly>
                {getIconByName('Trash', {className: 'size-[50%]'})}
              </Button>
            </div>
          </div>
        }
        classNames={{body: 'gap-y-4'}}>
        <div className="gap-y-4 flex flex-col">
          <Button size="sm" variant="light" onPress={openPath} className="flex flex-row justify-start -ml-3">
            {getIconByName('OpenFolder', {className: 'flex-shrink-0'})}
            <span className="truncate">{python.installFolder}</span>
          </Button>
          <Progress
            size="sm"
            minValue={0}
            value={size}
            color="primary"
            label="Disk Usage:"
            maxValue={maxDiskValue}
            isIndeterminate={isNil(size)}
            valueLabel={formatSizeMB(size || 0)}
            showValueLabel
          />
        </div>
      </Card>
    </div>
  );
}
