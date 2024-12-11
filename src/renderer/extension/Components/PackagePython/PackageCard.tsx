import {Button, Progress} from '@nextui-org/react';
import {Card} from 'antd';

import {Download_Icon} from '../../../src/assets/icons/SvgIcons/SvgIcons1';
import {Trash_Icon} from '../../../src/assets/icons/SvgIcons/SvgIcons3';
import {Warn_Icon} from '../SvgIcons';
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
              {versionUpdate && <Warn_Icon className="text-warning size-5" />}
            </div>
            <span className="text-tiny text-foreground-500">
              v{version} {versionUpdate && <span>(v{versionUpdate} Available)</span>}
            </span>
          </div>
          <div className="space-x-2 flex items-center">
            <Button size="sm" color="danger" variant="light" startContent={<Trash_Icon />}>
              Uninstall
            </Button>
            {versionUpdate && (
              <Button size="sm" variant="flat" color="success" startContent={<Download_Icon />}>
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
