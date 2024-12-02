import {Button, Chip, Progress} from '@nextui-org/react';
import {Card} from 'antd';
import {isNil} from 'lodash';
import {useMemo} from 'react';

import {formatSizeMB} from '../../../../cross/CrossUtils';
import rendererIpc from '../../../src/App/RendererIpc';
import {getIconByName} from '../../../src/assets/icons/SvgIconsContainer';
import {PythonInstallation, UninstallResult} from '../../Types';

type Props = {
  python: PythonInstallation;
  diskUsage: {path: string; value: number | undefined}[];
  maxDiskValue: number;
};
export default function PythonInstalledCard({python, diskUsage, maxDiskValue}: Props) {
  const size = useMemo(() => {
    return diskUsage.find(usage => usage.path === python.installFolder)?.value;
  }, [diskUsage]);

  const makeDefault = () => {};

  const remove = () => {
    window.electron.ipcRenderer.invoke('uninstall-python', python.installPath).then((result: UninstallResult) => {
      console.log(result);
    });
  };

  const openPath = () => {
    rendererIpc.file.openPath(python.installFolder);
  };

  return (
    <Card
      className={
        `w-[30rem] transition-colors duration-300 shadow-small` +
        ` ${
          python.isDefault
            ? 'border-success border-opacity-60 hover:border-opacity-100'
            : 'dark:hover:border-white/20 hover:border-black/20 '
        }`
      }
      title={
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-col my-3">
            <span>
              Python {python.version}
              {python.isDefault && (
                <Chip size="sm" radius="sm" variant="light" color="success">
                  Default
                </Chip>
              )}
            </span>
            <span className="text-tiny text-foreground-500">{python.architecture}</span>
          </div>
          <div className="space-x-2 flex items-center">
            {!python.isDefault && (
              <Button size="sm" variant="light" onPress={makeDefault}>
                Set as Default
              </Button>
            )}
            <Button size="sm" color="danger" variant="light" onPress={remove} isIconOnly>
              {getIconByName('Trash', {className: 'size-[50%]'})}
            </Button>
          </div>
        </div>
      }
      classNames={{body: 'gap-y-4'}}>
      <div className="gap-y-4 flex flex-col">
        <Button size="sm" variant="light" onPress={openPath} className="flex flex-row justify-start -ml-3">
          {getIconByName('Folder2', {className: 'flex-shrink-0'})}
          <span className="truncate">{python.installFolder}</span>
        </Button>
        <Progress
          size="sm"
          minValue={0}
          value={size}
          color="secondary"
          label="Disk Usage:"
          maxValue={maxDiskValue}
          isIndeterminate={isNil(size)}
          valueLabel={formatSizeMB(size || 0)}
          showValueLabel
        />
      </div>
    </Card>
  );
}
