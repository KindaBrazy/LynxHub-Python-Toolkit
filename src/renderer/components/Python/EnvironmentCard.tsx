import {Button, Card, Label, ProgressBar, Spinner} from '@heroui/react';
import {BoxMinimalistic, Diskette, FolderOpen} from '@solar-icons/react-perf/BoldDuotone';
import type {ReactNode} from 'react';

import {formatSizeMB} from '../../../cross/CrossExtUtils';
import {PythonIcon} from '../SvgIcons';
import Venv_Associate from './VirtualEnvironments/Venv_Associate';

type Props = {
  title: ReactNode;
  subtitle: ReactNode;
  badges?: ReactNode;
  actions?: ReactNode;
  path: string;
  packages: number;
  diskUsage?: number;
  maxDiskValue?: number;
  onOpenPath: () => void;
  associationType: 'python' | 'venv' | 'conda';
  iconClassName?: string;
  footer?: ReactNode;
  isBusy?: boolean;
  busyMessage?: string;
};

export default function EnvironmentCard({
  title,
  subtitle,
  badges,
  actions,
  path,
  packages,
  diskUsage,
  maxDiskValue,
  onOpenPath,
  associationType,
  iconClassName = 'text-blue-400',
  footer,
  isBusy,
  busyMessage,
}: Props) {
  const diskValue = diskUsage || 0;
  const diskMax = Math.max(maxDiskValue || diskValue || 1, 1);
  const packageCount = Number.isFinite(packages) ? packages : 0;

  return (
    <div className="grow relative">
      {isBusy && (
        <div
          className={
            'absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-background/70 backdrop-blur-sm'
          }>
          <div
            className={
              'flex flex-col items-center gap-y-2 rounded-2xl border border-divider bg-content1 px-5 py-4 shadow-xl'
            }>
            <Spinner size="lg" color="danger" />
            <span className="text-sm text-muted">{busyMessage}</span>
          </div>
        </div>
      )}

      <Card
        className={
          'group w-120 overflow-hidden border border-divider/70 bg-content1/85 shadow-sm transition-all' +
          ' duration-200 p-0 hover:-translate-y-0.5 hover:border-accent/45 hover:shadow-xl'
        }>
        <Card.Header className="flex flex-row items-start justify-between gap-x-4 px-5 pb-3 pt-4">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-x-3">
              <div
                className={
                  'flex size-10 shrink-0 items-center justify-center rounded-xl border border-divider' +
                  ' bg-surface-secondary/80 shadow-sm'
                }>
                <PythonIcon className={`size-6 ${iconClassName}`} />
              </div>
              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-2 text-base font-semibold text-foreground">
                  {title}
                </div>
                <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted">{subtitle}</div>
              </div>
            </div>
            {badges && <div className="mt-3 flex flex-wrap items-center gap-2">{badges}</div>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-x-2">{actions}</div>}
        </Card.Header>

        <Card.Content className="flex flex-col gap-y-4 px-5 pb-4 pt-1 text-sm">
          <Button
            size="sm"
            variant="tertiary"
            onPress={onOpenPath}
            className="min-w-0 justify-start rounded-xl border border-divider/70 bg-surface-secondary/60 px-3 text-xs"
            fullWidth>
            <FolderOpen className="size-4 shrink-0 text-accent" />
            <span className="truncate font-JetBrainsMono">{path}</span>
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-divider/70 bg-surface-secondary/45 p-3">
              <div className="mb-2 flex items-center gap-x-2 text-xs text-muted">
                <BoxMinimalistic className="size-4" />
                <span>Packages</span>
              </div>
              <div className="text-xl font-bold leading-none text-foreground">{packageCount}</div>
            </div>
            <div className="rounded-xl border border-divider/70 bg-surface-secondary/45 p-3">
              <div className="mb-2 flex items-center gap-x-2 text-xs text-muted">
                <Diskette className="size-4" />
                <span>Disk usage</span>
              </div>
              {diskUsage === undefined ? (
                <div className="flex h-5 items-center">
                  <Spinner size="sm" />
                </div>
              ) : (
                <div className="text-xl font-bold leading-none text-foreground">{formatSizeMB(diskValue)}</div>
              )}
            </div>
          </div>

          <ProgressBar
            size="sm"
            minValue={0}
            value={diskValue}
            maxValue={diskMax}
            isIndeterminate={diskUsage === undefined}>
            <Label className="text-xs text-muted">Storage footprint</Label>
            <ProgressBar.Output>
              {diskUsage === undefined ? 'Calculating...' : formatSizeMB(diskValue)}
            </ProgressBar.Output>
            <ProgressBar.Track>
              <ProgressBar.Fill />
            </ProgressBar.Track>
          </ProgressBar>
        </Card.Content>

        <Card.Footer className="flex-col gap-y-3 border-t border-divider/70 bg-surface-secondary/30 px-5 py-4">
          <Venv_Associate folder={path} type={associationType} />
          {footer}
        </Card.Footer>
      </Card>
    </div>
  );
}
