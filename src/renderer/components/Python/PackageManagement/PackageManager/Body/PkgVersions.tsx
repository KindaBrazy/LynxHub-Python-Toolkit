import {Button, ButtonProps, Chip, Description, Input, Modal, ProgressBar} from '@heroui/react';
import EmptyStateCard from '@lynx/components/EmptyStateCard';
import LynxTooltip from '@lynx/components/LynxTooltip';
import TabModal from '@lynx/components/TabModal';
import {compare as pepCompare} from '@renovatebot/pep440';
import {AltArrowDown, AltArrowUp} from '@solar-icons/react-perf/Bold';
import {BoxMinimalistic, ShieldWarning} from '@solar-icons/react-perf/BoldDuotone';
import {isEmpty} from 'lodash-es';
import {memo, useCallback, useEffect, useMemo, useState} from 'react';

import LynxScroll from '../../../../../../../../src/renderer/mainWindow/components/LynxScroll';
import {PackageInfo, PackageUpdate} from '../../../../../../cross/CrossExtTypes';
import {toastHolder} from '../../../../../DataHolder';
import pIpc from '../../../../../PIpc';

type UpdateType = {color: ButtonProps['variant']; disabled: boolean; isUpgrade: boolean | undefined};

type VersionInfo = {
  version: string;
} & UpdateType;

type Props = {
  pythonPath: string;
  item: PackageInfo;
  updated: (list: PackageUpdate | PackageUpdate[]) => void;
};

// Pure utility defined outside the component to prevent re-creation
const calculateUpdateType = (current: string, target: string): UpdateType => {
  if (isEmpty(target) || isEmpty(current)) {
    return {color: 'tertiary', isUpgrade: undefined, disabled: true};
  }

  try {
    const cmp = pepCompare(current, target);
    if (cmp === 0) {
      return {color: 'tertiary', isUpgrade: undefined, disabled: true};
    }

    const isUpgrade = cmp < 0; // current < target -> upgrade
    return {
      color: isUpgrade ? 'primary' : 'danger-soft',
      isUpgrade,
      disabled: false,
    };
  } catch (e) {
    // Fallback for non-compliant PEP 440 version schemes
    return {color: 'tertiary', isUpgrade: undefined, disabled: true};
  }
};

const PkgVersions = memo(({updated, item, pythonPath}: Props) => {
  const [availableVersion, setAvailableVersion] = useState<VersionInfo[] | null>(null);
  const [changingTo, setChangingTo] = useState<string | undefined>(undefined);
  const [isLoadingVersions, setIsLoadingVersions] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [customVersion, setCustomVersion] = useState<string>(item.version);
  const [confirmTarget, setConfirmTarget] = useState<VersionInfo | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (isOpen) {
      setIsLoadingVersions(true);
      pIpc
        .getPackageAllVersions(item.name)
        .then(versions => {
          if (!isMounted) return;
          const uniqueVersions = [...new Set(versions)];

          // Map versions and pre-calculate update properties once
          const mappedVersions = uniqueVersions.map(v => ({
            version: v,
            ...calculateUpdateType(item.version, v),
          }));

          setAvailableVersion(mappedVersions);
        })
        .catch(() => {
          if (!isMounted) return;
          toastHolder?.top.warning('Failed to fetch available versions!');
        })
        .finally(() => {
          if (isMounted) {
            setIsLoadingVersions(false);
          }
        });
    }

    return () => {
      isMounted = false;
      setAvailableVersion(null);
      setConfirmTarget(null);
    };
  }, [isOpen, item.name, item.version]);

  const changeVersion = useCallback(
    (targetVersion: string) => {
      setChangingTo(targetVersion);
      pIpc
        .changePackageVersion(pythonPath, item.name, item.version, targetVersion)
        .then(() => {
          updated({name: item.name, targetVersion: targetVersion});
          toastHolder?.top.success(`${item.name} package changed to ${targetVersion}`);
        })
        .catch(e => {
          console.info(e);
          toastHolder?.top.danger(`Failed change version to ${targetVersion}!`);
        })
        .finally(() => {
          setChangingTo(undefined);
          setIsOpen(false);
        });
    },
    [pythonPath, item, updated],
  );

  // Evaluate custom version inputs dynamically
  const customUpdateType = useMemo(() => {
    return calculateUpdateType(item.version, customVersion);
  }, [item.version, customVersion]);

  // Filter version array dynamically based on custom version typing
  const filteredVersions = useMemo(() => {
    if (!availableVersion || !customVersion) return [];
    const query = customVersion.trim().toLowerCase();
    if (isEmpty(query) || query === item.version.toLowerCase()) {
      return availableVersion;
    }
    return availableVersion.filter(v => v.version.toLowerCase().includes(query));
  }, [availableVersion, customVersion, item.version]);

  return (
    <>
      <TabModal size="lg" isOpen={isOpen} onOpenChange={setIsOpen} dialogClassName="p-0 py-4">
        <Modal.CloseTrigger />
        <Modal.Header className="justify-center gap-x-1 text-sm items-center flex flex-row">
          <span>Change</span>
          <span className="text-accent">{item.name}</span>
          <Chip size="sm" variant="soft" color="accent">
            {item.version}
          </Chip>
        </Modal.Header>
        <Modal.Body className="px-1">
          {isLoadingVersions || changingTo ? (
            <div className="size-full px-6 py-3">
              <ProgressBar isIndeterminate>
                <ProgressBar.Output />
                <ProgressBar.Track>
                  <ProgressBar.Fill />
                </ProgressBar.Track>
              </ProgressBar>
              <Description>
                {isLoadingVersions
                  ? 'Fetching available versions...'
                  : changingTo
                    ? `Changing from "${item.version}" to "${changingTo}"`
                    : ''}
              </Description>
            </div>
          ) : confirmTarget ? (
            /* Inline Confirmation Interface (replaces the heavy popover trees) */
            <div className="flex flex-col items-center justify-center p-6 gap-y-4">
              <p className="text-center text-sm text-semi-muted">
                Are you sure you want to {confirmTarget.isUpgrade ? 'upgrade' : 'downgrade'}{' '}
                <strong className="text-foreground">{item.name}</strong> to{' '}
                <strong className="text-accent">{confirmTarget.version}</strong>?
              </p>
              <div className="flex flex-row gap-x-2 justify-center w-full max-w-xs">
                <Button variant="tertiary" onPress={() => setConfirmTarget(null)} fullWidth>
                  Cancel
                </Button>
                <Button variant={confirmTarget.color} onPress={() => changeVersion(confirmTarget.version)} fullWidth>
                  Confirm
                </Button>
              </div>
            </div>
          ) : (
            <LynxScroll className="size-full">
              <div className="flex flex-row items-center w-full gap-x-2 px-4 py-2">
                <Input
                  variant="secondary"
                  value={customVersion}
                  placeholder="Enter custom version..."
                  onChange={e => setCustomVersion(e.target.value)}
                  fullWidth
                />
                {customUpdateType.isUpgrade !== undefined && (
                  <Button
                    variant={customUpdateType.color}
                    onPress={() => setConfirmTarget({version: customVersion, ...customUpdateType})}>
                    {customUpdateType.isUpgrade ? 'Upgrade' : 'Downgrade'}
                  </Button>
                )}
              </div>
              <div className="flex flex-row gap-2 flex-wrap pl-10 mt-2 pr-4">
                {filteredVersions.length > 0 ? (
                  filteredVersions.slice(0, 150).map(v => {
                    const icon = v.disabled ? null : v.isUpgrade ? <AltArrowUp /> : <AltArrowDown />;
                    return (
                      <Button
                        variant={v.color}
                        isDisabled={v.disabled}
                        className="shrink-0 max-w-34"
                        key={`${item.name}_${v.version}`}
                        onPress={() => setConfirmTarget(v)}
                        fullWidth>
                        {icon}
                        {v.version}
                      </Button>
                    );
                  })
                ) : (
                  <EmptyStateCard
                    variant="secondary"
                    className="size-full mr-6"
                    description="Something goes wrong, please try again!"
                    icon={<ShieldWarning className="size-10 text-warning" />}
                  />
                )}
                {filteredVersions.length > 150 && (
                  <p className="text-xs text-foreground-400 w-full text-center mt-2">
                    Showing first 150 versions. Use search to narrow down.
                  </p>
                )}
              </div>
            </LynxScroll>
          )}
        </Modal.Body>
      </TabModal>
      <LynxTooltip delay={300} content="Change package version">
        <Button size="sm" variant="tertiary" isPending={!!changingTo} onPress={() => setIsOpen(true)} isIconOnly>
          <BoxMinimalistic className="size-3.5" />
        </Button>
      </LynxTooltip>
    </>
  );
});

export default PkgVersions;
