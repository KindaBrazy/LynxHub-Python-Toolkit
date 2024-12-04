import {Button, Progress} from '@nextui-org/react';
import {Card} from 'antd';

import {getIconByName} from '../../../src/assets/icons/SvgIconsContainer';
import {WarnIcon} from '../SvgIcons';
import {DataType} from './PythonPackageManager';

type Props = DataType & {
  maxDiskValue: number;
};

export default function PackageCard({version, versionUpdate, name, size, maxDiskValue}: Props) {
  return (
    <Card
      className={
        `w-full transition-colors duration-300 shadow-small ` + ` dark:hover:border-white/20 hover:border-black/20 `
      }
      classNames={{body: '!pt-0'}}>
      <div className="flex flex-col">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-col my-3">
            <div className="text-large font-semibold flex flex-row items-center space-x-1">
              <span>{name}</span>
              {versionUpdate && <WarnIcon className="text-warning size-5" />}
            </div>
            <span className="text-tiny text-foreground-500">
              v{version} {versionUpdate && <span>(v{versionUpdate} Available)</span>}
            </span>
          </div>
          <div className="space-x-2 flex items-center">
            <Button size="sm" color="danger" variant="light" startContent={getIconByName('Trash')}>
              Uninstall
            </Button>
            {versionUpdate && (
              <Button size="sm" variant="flat" color="success" startContent={getIconByName('Download')}>
                Update
              </Button>
            )}
          </div>
        </div>
        <Progress
          size="sm"
          minValue={0}
          value={size}
          label="Size:"
          maxValue={maxDiskValue}
          valueLabel={`${size} MB`}
          showValueLabel
        />
      </div>
    </Card>
  );
}
