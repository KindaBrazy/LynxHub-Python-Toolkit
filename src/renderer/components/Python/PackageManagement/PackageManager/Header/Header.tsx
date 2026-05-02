import {Avatar, Chip, ProgressBar, SearchField, Selection} from '@heroui-v3/react';
import {topToast} from '@lynx/layouts/ToastProviders';
import {extractGitUrl, getFallbackString} from '@lynx_common/utils';
import {compact, isEmpty} from 'lodash-es';
import {Dispatch, ReactNode, SetStateAction, useEffect, useState} from 'react';

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
}: Props) {
  const [isReqAvailable, setIsReqAvailable] = useState<boolean>(false);
  const [reqPackageCount, setReqPackageCount] = useState<number>(0);
  const [progressValue, setProgressValue] = useState<number>(0);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [pythonVersion, setPythonVersion] = useState<string>('');

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
        topToast.success(`Successfully updated all selected packages (${updateList.length} total).`);
        updated(updateList);
      })
      .catch(() => {
        topToast.danger(`Failed to update packages`);
      })
      .finally(() => {
        setIsUpdating(false);
      });

    setIsUpdateTerminalOpen(true);
  };

  return (
    <>
      {progressValue > 0 && (
        <ProgressBar size="sm" color="accent" value={progressValue} className="absolute -top-1 inset-x-0">
          <ProgressBar.Track>
            <ProgressBar.Fill />
          </ProgressBar.Track>
        </ProgressBar>
      )}
      <div className="flex flex-row justify-between w-full">
        {isValidPython ? (
          <>
            <div className="flex flex-row items-center gap-x-2">
              {avatarUrl && (
                <Avatar className="size-5">
                  <Avatar.Image alt={title} src={avatarUrl} />
                  <Avatar.Fallback className="text-xs">{getFallbackString(title)}</Avatar.Fallback>
                </Avatar>
              )}
              <span>{title}</span>
              {pythonVersion && (
                <Chip size="sm" variant="soft" color="accent" className="px-2">
                  Python {pythonVersion}
                </Chip>
              )}
              <Chip size="sm" variant="soft">
                {packages.length}
              </Chip>
            </div>
          </>
        ) : (
          <span>{title}</span>
        )}
      </div>
      {!isEmpty(packages) && (
        <div className="flex flex-row items-center gap-x-2">
          <SearchField variant="secondary" value={searchValue} onChange={setSearchValue} fullWidth>
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <FilterButton setSelectedFilter={setSelectedFilter} updateAvailable={!isEmpty(packagesUpdate)} />
        </div>
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
            <InstallerModal refresh={refresh} pythonPath={pythonPath} />

            <RequirementsBtn
              id={id}
              projectPath={projectPath}
              setIsReqAvailable={setIsReqAvailable}
              setReqPackageCount={setReqPackageCount}
            />
          </>
        )}

        {isValidPython && actionButtons?.map(ActionButton => ActionButton)}
      </div>
    </>
  );
}
