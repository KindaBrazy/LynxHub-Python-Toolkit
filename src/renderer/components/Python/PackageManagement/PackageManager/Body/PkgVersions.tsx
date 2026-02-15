import {
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
} from '@heroui/react';
import {lynxTopToast} from '@lynx/utils/hooks';
import {isEmpty} from 'lodash';
import {memo, useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import semver, {compare, valid} from 'semver';

import LynxScroll from '../../../../../../../../src/renderer/main_window/components/LynxScroll';
import {Circle_Icon} from '../../../../../../../../src/renderer/shared/assets/icons';
import {PackageInfo, PackageUpdate} from '../../../../../../cross/CrossExtTypes';
import pIpc from '../../../../../PIpc';
import {AltArrow_Icon, SolarBoxMinimalisticBoldDuotone} from '../../../../SvgIcons';

type updateType = {color: 'default' | 'success' | 'danger'; disabled: boolean; isUpgrade: boolean | undefined};
type Props = {
  pythonPath: string;
  item: PackageInfo;
  updated: (list: PackageUpdate | PackageUpdate[]) => void;
  show: string;
};
const PkgVersions = memo(({updated, item, pythonPath, show}: Props) => {
  const dispatch = useDispatch();
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
          lynxTopToast(dispatch).warning('Failed to fetch available versions!');
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
          lynxTopToast(dispatch).success(`${item.name} package changed to ${targetVersion}`);
        })
        .catch(e => {
          console.info(e);
          lynxTopToast(dispatch).error(`Failed change version to ${targetVersion}!`);
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
      if (isEmpty(version)) return {color: 'default', isUpgrade: undefined, disabled: true};

      const currentVersion = semver.coerce(item.version)?.version;
      const targetVersion = semver.coerce(version)?.version;
      if (!currentVersion || !targetVersion) return {color: 'default', isUpgrade: undefined, disabled: false};

      const areVersionsValid = valid(currentVersion) && valid(targetVersion);
      if (!areVersionsValid) {
        return {color: 'default', isUpgrade: undefined, disabled: false};
      }

      const comparison = compare(currentVersion, targetVersion);
      if (comparison === 0) {
        return {color: 'default', isUpgrade: undefined, disabled: true};
      }

      const isUpgrade = comparison === -1;
      return {
        color: isUpgrade ? 'success' : 'danger',
        isUpgrade,
        disabled: false,
      };
    },
    [item],
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        placement="center"
        scrollBehavior="inside"
        onOpenChange={setIsOpen}
        classNames={{backdrop: `!top-10 ${show}`, wrapper: `!top-10 pb-8 ${show}`}}
        hideCloseButton>
        <ModalContent>
          <ModalHeader className="justify-center gap-x-1 text-sm items-center">
            <span>Change</span>
            <span className="text-primary-600">{item.name}</span>
            <Chip size="sm" variant="flat" className="text-secondary-600">
              {item.version}
            </Chip>
          </ModalHeader>
          <ModalBody className="px-0">
            {isLoadingVersions || changingTo ? (
              <div className="size-full px-6 py-4">
                <Progress
                  label={
                    isLoadingVersions
                      ? 'Fetching latest available versions.'
                      : changingTo
                        ? `Changing from "${item.version}" to "${changingTo}"`
                        : ''
                  }
                  isIndeterminate
                />
              </div>
            ) : (
              <LynxScroll className="size-full px-2 py-4">
                <div className="flex flex-row flex-wrap gap-2">
                  <div className="flex flex-row items-center w-full gap-x-2 px-2">
                    <Input value={customVersion} placeholder="Custom version" onValueChange={setCustomVersion} />
                    {getUpdateType(customVersion).isUpgrade !== undefined && (
                      <Button
                        variant="flat"
                        color={getUpdateType(customVersion).color}
                        onPress={() => changeVersion(customVersion)}>
                        {getUpdateType(customVersion).isUpgrade ? 'Upgrade' : 'Downgrade'}
                      </Button>
                    )}
                  </div>
                  {availableVersion?.map(version => {
                    const updateType = getUpdateType(version);
                    const icon = updateType.disabled ? (
                      <Circle_Icon />
                    ) : updateType.isUpgrade ? (
                      <AltArrow_Icon className="rotate-180" />
                    ) : (
                      <AltArrow_Icon />
                    );
                    return (
                      <Popover
                        key={`${item.name}_${version}`}
                        className="max-w-[17rem] before:bg-foreground-100"
                        showArrow>
                        <PopoverTrigger>
                          <Button
                            variant="light"
                            startContent={icon}
                            color={updateType.color}
                            className="shrink-0 max-w-34"
                            isDisabled={updateType.disabled}
                            fullWidth>
                            {version}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-4 border border-foreground-100 gap-y-2">
                          <span>
                            Are you sure you want to {updateType.isUpgrade ? 'upgrade' : 'downgrade'} to {version}?
                          </span>
                          <Button size="sm" onPress={() => changeVersion(version)} fullWidth>
                            Confirm
                          </Button>
                        </PopoverContent>
                      </Popover>
                    );
                  })}
                </div>
              </LynxScroll>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" color="warning" onPress={() => setIsOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Button size="sm" variant="flat" isLoading={!!changingTo} onPress={() => setIsOpen(true)} isIconOnly>
        <SolarBoxMinimalisticBoldDuotone className="size-3.5" />
      </Button>
    </>
  );
});

export default PkgVersions;
