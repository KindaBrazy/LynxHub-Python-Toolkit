import {Button, Card, Label, ProgressBar, Spinner} from '@heroui/react';
import LynxTooltip from '@lynx/components/LynxTooltip';
import {cardsActions} from '@lynx/redux/reducers/cards';
import {useTabsState} from '@lynx/redux/reducers/tabs';
import {terminalLineEnding} from '@lynx_common/utils';
import ptyIpc from '@lynx_shared/ipc/pty';
import {BoxMinimalistic, Diskette, FolderOpen} from '@solar-icons/react-perf/BoldDuotone';
import {Terminal} from 'lucide-react';
import type {ReactNode} from 'react';
import {useDispatch} from 'react-redux';

import {formatSizeMB} from '../../../cross/CrossExtUtils';
import pIpc from '../../PIpc';
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
  condaName?: string;
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
  condaName,
  iconClassName = 'text-blue-400',
  footer,
  isBusy,
  busyMessage,
}: Props) {
  const diskValue = diskUsage || 0;
  const diskMax = Math.max(maxDiskValue || diskValue || 1, 1);
  const packageCount = Number.isFinite(packages) ? packages : 0;
  const activeTab = useTabsState('activeTab');
  const dispatch = useDispatch();

  const openTerminal = () => {
    pIpc
      .getEnvironmentActivationCommand({dir: path, type: associationType, condaName})
      .then(command => {
        const id = `${activeTab}_terminal`;
        dispatch(cardsActions.addRunningEmpty({tabId: activeTab, type: 'terminal'}));
        setTimeout(() => ptyIpc.write(id, `${command}${terminalLineEnding}`), 500);
      })
      .catch(error => {
        console.error('Failed to open terminal in environment:', error);
      });
  };

  return (
    <div className="relative">
      {isBusy && (
        <div
          className={
            'absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-background/70 backdrop-blur-sm'
          }>
          <div
            className={
              'flex flex-col items-center gap-y-2 rounded-3xl border border-divider bg-content1 px-4 py-3 shadow-xl'
            }>
            <Spinner size="md" color="danger" />
            <span className="text-xs text-muted">{busyMessage}</span>
          </div>
        </div>
      )}

      <Card
        className={
          'group w-103 overflow-hidden border border-divider/70 bg-content1/90 p-0 shadow-sm transition-all' +
          ' duration-200 hover:border-divider hover:bg-content1 hover:shadow-md'
        }>
        <Card.Header className="flex flex-row items-start justify-between gap-x-3 px-4 pb-2.5 pt-3.5">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-x-2.5">
              <div
                className={
                  'flex size-10 shrink-0 items-center justify-center rounded-full border border-divider' +
                  ' bg-surface-secondary/70'
                }>
                <PythonIcon className={`size-6 ${iconClassName}`} />
              </div>
              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-sm font-semibold text-foreground">
                  {title}
                </div>
                <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-1.5 text-xs text-muted">{subtitle}</div>
              </div>
            </div>
            {badges && <div className="mt-2 flex flex-wrap items-center gap-1.5">{badges}</div>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-x-1.5">{actions}</div>}
        </Card.Header>

        <Card.Content className="flex flex-col gap-y-3 px-4 pb-3 pt-0 text-sm">
          <div className="flex min-w-0 gap-2">
            <Button
              size="sm"
              variant="tertiary"
              onPress={onOpenPath}
              className={'h-8 min-w-0 justify-start border border-divider/60 bg-surface-secondary/45 px-2.5 text-xs'}
              fullWidth>
              <FolderOpen className="size-3.5 shrink-0 text-muted" />
              <span className="truncate font-JetBrainsMono">{path}</span>
            </Button>
            <LynxTooltip delay={300} content="Open terminal in environment">
              <Button
                size="sm"
                variant="tertiary"
                onPress={openTerminal}
                className="h-8 w-8 min-w-8 shrink-0 border border-divider/60 bg-surface-secondary/45"
                isIconOnly>
                <Terminal className="size-3.5 text-muted" />
              </Button>
            </LynxTooltip>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-3xl border border-divider/60 bg-surface-secondary/35 p-3">
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-x-1.5 text-xs text-muted">
                <BoxMinimalistic className="size-3.5" />
                <span>Packages</span>
              </div>
              <div className="text-base font-semibold leading-none text-foreground">{packageCount}</div>
            </div>
            <div className="min-w-0 border-l border-divider/60 pl-2.5">
              <div className="mb-1 flex items-center gap-x-1.5 text-xs text-muted">
                <Diskette className="size-3.5" />
                <span>Disk usage</span>
              </div>
              {diskUsage === undefined ? (
                <div className="flex h-4 items-center">
                  <Spinner size="sm" />
                </div>
              ) : (
                <div className="truncate text-base font-semibold leading-none text-foreground">
                  {formatSizeMB(diskValue)}
                </div>
              )}
            </div>
          </div>

          <ProgressBar
            size="sm"
            minValue={0}
            value={diskValue}
            maxValue={diskMax}
            isIndeterminate={diskUsage === undefined}>
            <Label className="text-xs text-muted">Storage</Label>
            <ProgressBar.Output>
              {diskUsage === undefined ? 'Calculating...' : formatSizeMB(diskValue)}
            </ProgressBar.Output>
            <ProgressBar.Track>
              <ProgressBar.Fill />
            </ProgressBar.Track>
          </ProgressBar>
        </Card.Content>

        <Card.Footer className="flex-col gap-y-2 border-t border-divider/60 bg-surface-secondary/20 px-4 py-3">
          <Venv_Associate folder={path} type={associationType} />
          {footer}
        </Card.Footer>
      </Card>
    </div>
  );
}
