import {Avatar, Chip, Input, ModalHeader, Progress, Selection} from '@heroui/react';
import {extractGitUrl} from '@lynx_common/utils';
import {compact, isEmpty} from 'lodash';
import {Dispatch, ReactNode, SetStateAction, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {lynxTopToast} from '../../../../../../../../src/renderer/main_window/hooks/utils';
import {Circle_Icon} from '../../../../../../../../src/renderer/shared/assets/icons';
import {FilterKeys, PackageInfo, PackageUpdate, SitePackages_Info} from '../../../../../../cross/CrossExtTypes';
import {allCardsExt} from '../../../../../DataHolder';
import pIpc from '../../../../../PIpc';
import RequirementsBtn from '../../Requirements/RequirementsModalButton';
import FilterButton from './FilterButton';
import InstallerModal from './InstallerModal';
import UpdateButton from './UpdateButton';

type Props = {
  title: string;
  actionButtons?: ReactNode[];
  searchValue: string;
  setSearchValue: Dispatch<SetStateAction<string>>;
  packages: PackageInfo[];
  packagesUpdate: SitePackages_Info[];
  checkingUpdates: boolean;
  pythonPath: string;
  updated: (list: PackageUpdate | PackageUpdate[]) => void;
  refresh: () => void;
  isValidPython: boolean;
  checkForUpdates: (type: 'req' | 'normal') => void;

  id: string;
  projectPath?: string;
  setSelectedFilter: Dispatch<SetStateAction<FilterKeys>>;
  selectedFilter: FilterKeys;
  selectedKeys: Selection;
  visibleItems: PackageInfo[];

  setIsUpdating: Dispatch<SetStateAction<boolean>>;
  setIsUpdateTerminalOpen: Dispatch<SetStateAction<boolean>>;
  isUpdating: boolean;

  show: string;
};

export default function PackageManagerHeader({
  searchValue,
  setSearchValue,
  packages,
  packagesUpdate,
  checkingUpdates,
  pythonPath,
  updated,
  refresh,
  title,
  actionButtons,
  isValidPython,
  checkForUpdates,
  id,
  projectPath,
  setIsUpdateTerminalOpen,
  setSelectedFilter,
  selectedFilter,
  selectedKeys,
  visibleItems,
  setIsUpdating,
  isUpdating,
  show,
}: Props) {
  const [isReqAvailable, setIsReqAvailable] = useState<boolean>(false);
  const [reqPackageCount, setReqPackageCount] = useState<number>(0);
  const [progressValue, setProgressValue] = useState<number>(0);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [pythonVersion, setPythonVersion] = useState<string>('');

  const dispatch = useDispatch();

  useEffect(() => {
    const url = allCardsExt.find(item => item.id === id)?.repoUrl;
    if (url) {
      const avatar = extractGitUrl(url).avatarUrl;
      setAvatarUrl(avatar);
    }
  }, []);

  useEffect(() => {
    if (pythonPath) {
      pIpc
        .getPythonVersion(pythonPath)
        .then(version => {
          setPythonVersion(`${version.major}.${version.minor}.${version.patch}`);
        })
        .catch(console.log);
    }
  }, [pythonPath]);

  const update = () => {
    setIsUpdating(true);
    let updateList: PackageUpdate[];
    if (selectedKeys === 'all') {
      updateList =
        selectedFilter === 'all'
          ? packagesUpdate.map(item => ({name: item.name, targetVersion: item.version}))
          : visibleItems.map(item => ({name: item.name, targetVersion: item.updateVersion}));
    } else {
      updateList = compact(
        packagesUpdate.map(item => {
          const selections = Array.from(selectedKeys) as string[];

          if (selections.includes(item.name)) return {name: item.name, targetVersion: item.version};

          return null;
        }),
      );
    }
    pIpc
      .updatePackages(pythonPath, updateList)
      .then(() => {
        lynxTopToast(dispatch).success(`Successfully updated all selected packages (${updateList.length} total).`);
        updated(updateList);
      })
      .catch(() => {
        lynxTopToast(dispatch).error(`Failed to update packages`);
      })
      .finally(() => {
        setIsUpdating(false);
      });

    setIsUpdateTerminalOpen(true);
  };

  return (
    <ModalHeader className="bg-foreground-200 dark:bg-LynxRaisinBlack items-center flex-col gap-y-2">
      {progressValue > 0 && (
        <Progress
          size="sm"
          radius="none"
          color="primary"
          value={progressValue}
          className="absolute top-0"
          aria-label="Package manager progress bar"
        />
      )}
      <div className="flex flex-row justify-between w-full">
        {isValidPython ? (
          <>
            <div className="flex flex-row items-center gap-x-2">
              {avatarUrl && <Avatar title={title} src={avatarUrl} />}
              <span>{title}</span>
              {pythonVersion && (
                <Chip size="sm" variant="flat" color="primary">
                  Python {pythonVersion}
                </Chip>
              )}
              <Chip size="sm" variant="flat">
                {packages.length}
              </Chip>
            </div>
            <FilterButton setSelectedFilter={setSelectedFilter} updateAvailable={!isEmpty(packagesUpdate)} />
          </>
        ) : (
          <span>{title}</span>
        )}
      </div>
      {!isEmpty(packages) && (
        <Input
          type="search"
          className="pt-1"
          value={searchValue}
          startContent={<Circle_Icon />}
          onValueChange={setSearchValue}
          placeholder="Search for packages..."
        />
      )}
      <div className="gap-x-2 flex justify-between items-center w-full mt-2">
        {isValidPython && (
          <UpdateButton
            update={update}
            isUpdating={isUpdating}
            visibleItems={visibleItems}
            selectedKeys={selectedKeys}
            selectedFilter={selectedFilter}
            isReqAvailable={isReqAvailable}
            packagesUpdate={packagesUpdate}
            reqPackageCount={reqPackageCount}
            allPackageCount={packages.length}
            checkForUpdates={checkForUpdates}
            checkingUpdates={checkingUpdates}
            setProgressValue={setProgressValue}
          />
        )}
        {isValidPython && (
          <>
            <InstallerModal show={show} refresh={refresh} pythonPath={pythonPath} />

            <RequirementsBtn
              id={id}
              show={show}
              projectPath={projectPath}
              setIsReqAvailable={setIsReqAvailable}
              setReqPackageCount={setReqPackageCount}
            />
          </>
        )}

        {isValidPython && actionButtons?.map(ActionButton => ActionButton)}
      </div>
    </ModalHeader>
  );
}
