import {Button, Chip, Progress} from '@nextui-org/react';
import {Card} from 'antd';

import {getIconByName} from '../../../src/assets/icons/SvgIconsContainer';

type Props = {
  version: string;
  isDefault: boolean;
  architecture: string;
  location: string;
  diskUsage: number;
  maxDiskValue: number;
};
export default function PythonInstalledCard({
  version,
  isDefault,
  location,
  architecture,
  diskUsage,
  maxDiskValue,
}: Props) {
  const makeDefault = () => {};
  const remove = () => {};
  return (
    <Card
      className={
        `w-[30rem] transition-colors duration-300 shadow-small` +
        ` ${
          isDefault
            ? 'border-success border-opacity-60 hover:border-opacity-100'
            : 'dark:hover:border-white/20 hover:border-black/20 '
        }`
      }
      title={
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-col my-3">
            <span>
              Python {version}
              {isDefault && (
                <Chip size="sm" radius="sm" variant="light" color="success">
                  Default
                </Chip>
              )}
            </span>
            <span className="text-tiny text-foreground-500">{architecture}</span>
          </div>
          <div className="space-x-2 flex items-center">
            {!isDefault && (
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
        <Button size="sm" variant="light" className="flex flex-row justify-start -ml-3">
          {getIconByName('Folder2', {className: 'flex-shrink-0'})}
          <span className="truncate">{location}</span>
        </Button>
        <Progress
          size="sm"
          minValue={0}
          value={diskUsage}
          label="Disk Usage:"
          maxValue={maxDiskValue}
          valueLabel={`${diskUsage} MB`}
          showValueLabel
        />
      </div>
    </Card>
  );
}
