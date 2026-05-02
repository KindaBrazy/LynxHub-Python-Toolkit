import {Button, ButtonProps, Chip, Description, Input, Modal, Popover, ProgressBar} from '@heroui-v3/react';
import TabModal from '@lynx/components/TabModal';
import {topToast} from '@lynx/layouts/ToastProviders';
import {AltArrowDown, AltArrowUp} from '@solar-icons/react-perf/Bold';
import {BoxMinimalistic} from '@solar-icons/react-perf/BoldDuotone';
import {isEmpty} from 'lodash-es';
import {memo, useCallback, useEffect, useState} from 'react';
import semver, {compare, valid} from 'semver';

import LynxScroll from '../../../../../../../../src/renderer/mainWindow/components/LynxScroll';
import {PackageInfo, PackageUpdate} from '../../../../../../cross/CrossExtTypes';
import pIpc from '../../../../../PIpc';

type updateType = {color: ButtonProps['variant']; disabled: boolean; isUpgrade: boolean | undefined};
type Props = {
  pythonPath: string;
  item: PackageInfo;
  updated: (list: PackageUpdate | PackageUpdate[]) => void;
};
const PkgVersions = memo(({updated, item, pythonPath}: Props) => {
  const [availableVersion, setAvailableVersion] = useState<string[] | null>(null);

  const [changingTo, setChangingTo] = useState<string | undefined>(undefined);
  const [isLoadingVersions, setIsLoadingVersions] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [customVersion, setCustomVersion] = useState<string>(item.version);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingVersions(true);
      pIpc
        .getPackageAllVersions(item.name)
        .then(versions => {
          const uniqueVersions = [...new Set(versions)];
          setAvailableVersion(uniqueVersions);
        })
        .catch(() => {
          topToast.warning('Failed to fetch available versions!');
        })
        .finally(() => {
          setIsLoadingVersions(false);
        });
    }

    return () => {
      setAvailableVersion(null);
    };
  }, [isOpen]);

  const changeVersion = useCallback(
    (targetVersion: string) => {
      setChangingTo(targetVersion);
      pIpc
        .changePackageVersion(pythonPath, item.name, item.version, targetVersion)
        .then(() => {
          updated({name: item.name, targetVersion: targetVersion});
          topToast.success(`${item.name} package changed to ${targetVersion}`);
        })
        .catch(e => {
          console.info(e);
          topToast.danger(`Failed change version to ${targetVersion}!`);
        })
        .finally(() => {
          setChangingTo(undefined);
          setIsOpen(false);
        });
    },
    [pythonPath, item],
  );

  const getUpdateType = useCallback(
    (version: string): updateType => {
      if (isEmpty(version)) return {color: 'tertiary', isUpgrade: undefined, disabled: true};

      const currentVersion = semver.coerce(item.version)?.version;
      const targetVersion = semver.coerce(version)?.version;
      if (!currentVersion || !targetVersion) return {color: 'tertiary', isUpgrade: undefined, disabled: false};

      const areVersionsValid = valid(currentVersion) && valid(targetVersion);
      if (!areVersionsValid) {
        return {color: 'tertiary', isUpgrade: undefined, disabled: false};
      }

      const comparison = compare(currentVersion, targetVersion);
      if (comparison === 0) {
        return {color: 'tertiary', isUpgrade: undefined, disabled: true};
      }

      const isUpgrade = comparison === -1;
      return {
        color: isUpgrade ? 'primary' : 'danger-soft',
        isUpgrade,
        disabled: false,
      };
    },
    [item],
  );

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
                  ? 'Fetching latest available versions.'
                  : changingTo
                    ? `Changing from "${item.version}" to "${changingTo}"`
                    : ''}
              </Description>
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
                {getUpdateType(customVersion).isUpgrade !== undefined && (
                  <Button variant={getUpdateType(customVersion).color} onPress={() => changeVersion(customVersion)}>
                    {getUpdateType(customVersion).isUpgrade ? 'Upgrade' : 'Downgrade'}
                  </Button>
                )}
              </div>
              <div className="flex flex-row gap-2 flex-wrap pl-10 mt-2">
                {availableVersion?.map(version => {
                  const updateType = getUpdateType(version);
                  const icon = updateType.disabled ? null : updateType.isUpgrade ? <AltArrowUp /> : <AltArrowDown />;
                  return (
                    <Popover key={`${item.name}_${version}`}>
                      <Button
                        variant={updateType.color}
                        className="shrink-0 max-w-34"
                        isDisabled={updateType.disabled}
                        fullWidth>
                        {icon}
                        {version}
                      </Button>
                      <Popover.Content className="max-w-68">
                        <Popover.Dialog className="gap-y-2 flex flex-col">
                          <Popover.Arrow />
                          <Popover.Heading>
                            Are you sure you want to {updateType.isUpgrade ? 'upgrade' : 'downgrade'} to {version}?
                          </Popover.Heading>
                          <Button size="sm" onPress={() => changeVersion(version)} fullWidth>
                            Confirm
                          </Button>
                        </Popover.Dialog>
                      </Popover.Content>
                    </Popover>
                  );
                })}
              </div>
            </LynxScroll>
          )}
        </Modal.Body>
      </TabModal>
      <Button size="sm" variant="tertiary" isPending={!!changingTo} onPress={() => setIsOpen(true)} isIconOnly>
        <BoxMinimalistic className="size-3.5" />
      </Button>
    </>
  );
});

export default PkgVersions;
