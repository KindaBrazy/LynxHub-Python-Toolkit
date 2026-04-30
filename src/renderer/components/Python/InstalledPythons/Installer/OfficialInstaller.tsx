import {
  Button,
  Description,
  Label,
  Link,
  ProgressBar,
  SearchField,
  Spinner,
  UseOverlayStateReturn,
} from '@heroui-v3/react';
import EmptyStateCard from '@lynx/components/EmptyStateCard';
import LynxTooltip from '@lynx/components/LynxTooltip';
import {topToast} from '@lynx/layouts/ToastProviders';
import {formatSize} from '@lynx_common/utils';
import {DownloadMinimalistic, Inbox, Refresh, ShieldWarning} from '@solar-icons/react-perf/BoldDuotone';
import {isEmpty, isNil, isString} from 'lodash-es';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';

import {DlProgressOfficial, PythonVersion} from '../../../../../cross/CrossExtTypes';
import pIpc from '../../../../PIpc';

type Props = {
  state: UseOverlayStateReturn;
  refresh: (research: boolean) => void;
  installed: string[];
  setCloseDisabled: Dispatch<SetStateAction<boolean>>;
};

export default function InstallerOfficial({refresh, installed, state, setCloseDisabled}: Props) {
  const [versions, setVersions] = useState<PythonVersion[]>([]);
  const [searchVersions, setSearchVersions] = useState<PythonVersion[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');

  const [installStage, setInstallStage] = useState<'installing' | 'downloading'>();
  const [downloadProgress, setDownloadProgress] = useState<DlProgressOfficial>(undefined);

  const [installingVersion, setInstallingVersion] = useState<PythonVersion | undefined>(undefined);
  const [errorLoadingVersion, setErrorLoadingVersion] = useState<{title: string; description: string} | undefined>(
    undefined,
  );

  const fetchPythonList = (refresh: boolean) => {
    setLoadingList(true);

    pIpc.storage.getAvailableOfficial().then(cachedList => {
      if (!refresh && (!isNil(cachedList) || !isEmpty(cachedList))) {
        setVersions(cachedList.filter(item => !installed.includes(item.version)));
        setLoadingList(false);
      } else {
        pIpc
          .getAvailableOfficial()
          .then((result: PythonVersion[]) => {
            pIpc.storage.setAvailableOfficial(result);
            const filteredVersions = result.filter(item => !installed.includes(item.version));
            setVersions(filteredVersions);
            setLoadingList(false);
            setErrorLoadingVersion(undefined);
          })
          .catch(e => {
            if (e.message && isString(e.message)) {
              if (e.message.toLowerCase().includes('deadsnakes')) {
                setErrorLoadingVersion({
                  title: 'Deadsnakes PPA Missing',
                  description:
                    'The application tried to add the Deadsnakes PPA but failed. ' +
                    'Please add it manually by running the following commands :' +
                    ' `sudo add-apt-repository -y ppa:deadsnakes/ppa` and then `sudo apt update`.',
                });
              } else {
                setErrorLoadingVersion({title: 'Failed to fetch Python versions', description: e.message});
              }
            } else {
              setErrorLoadingVersion({
                title: 'Failed to fetch Python versions',
                description:
                  'Please check your internet connection and try again.' +
                  ' If the problem persists, please open an issue on GitHub.',
              });
            }
          });
      }
    });
  };

  useEffect(() => {
    if (state.isOpen) fetchPythonList(false);
  }, [state.isOpen]);

  useEffect(() => {
    if (isEmpty(inputValue)) {
      setSearchVersions(versions);
    } else {
      setSearchVersions(versions.filter(version => version.version.startsWith(inputValue)));
    }
  }, [inputValue, versions]);

  const installPython = (version: PythonVersion) => {
    setInstallingVersion(version);
    setCloseDisabled(true);

    const osPlatform = window.osPlatform;

    switch (osPlatform) {
      case 'win32':
      case 'darwin':
        // Windows and macOS both download installer files (.exe/.pkg) then install
        pIpc.off_DlProgressOfficial();
        pIpc.on_DlProgressOfficial((_, stage, progress) => {
          setInstallStage(stage);
          if (stage === 'downloading') {
            setDownloadProgress(progress);
          }
        });
        break;
      case 'linux':
        // Linux installs via apt, no download progress
        setInstallStage('installing');
        break;
    }

    pIpc
      .installOfficial(version)
      .then(() => {
        refresh(true);
        state.close();
        console.log('installed', version);
        topToast.success(`Python${version.version} installed successfully.`);
      })
      .catch(err => {
        console.log(err);
        topToast.danger(`Failed to install python${version.version}!`);
      })
      .finally(() => {
        setInstallingVersion(undefined);
        setCloseDisabled(false);
      });
  };

  return (
    <>
      {isEmpty(installingVersion) && (
        <div className="flex flex-row gap-x-2 px-4 py-1 items-center">
          <SearchField value={inputValue} variant="secondary" onChange={setInputValue} fullWidth>
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <LynxTooltip delay={300} content="Refresh available Python versions">
            <Button variant="tertiary" onPress={() => fetchPythonList(true)} isIconOnly>
              <Refresh />
            </Button>
          </LynxTooltip>
        </div>
      )}
      {errorLoadingVersion ? (
        <div className="size-full py-2 text-danger flex flex-col items-center justify-center gap-4">
          <ShieldWarning className="size-20" />
          <span className="text-lg">{errorLoadingVersion.title}</span>
          <span className="text-warning text-sm">{errorLoadingVersion.description}</span>
        </div>
      ) : (
        <div className="px-4">
          {!isEmpty(installingVersion) ? (
            installStage === 'installing' ? (
              <ProgressBar className="my-4" isIndeterminate>
                <Label>Installing Python v{installingVersion?.version}...</Label>
                <ProgressBar.Output />
                <ProgressBar.Track>
                  <ProgressBar.Fill />
                </ProgressBar.Track>
              </ProgressBar>
            ) : (
              <ProgressBar className="my-4" value={(downloadProgress?.percentage || 0.1) * 100}>
                <Label>Downloading {installingVersion?.url.split('/').pop()}...</Label>
                <ProgressBar.Output>
                  {formatSize(downloadProgress?.downloaded)} / {formatSize(downloadProgress?.total)}
                </ProgressBar.Output>
                <ProgressBar.Track>
                  <ProgressBar.Fill />
                </ProgressBar.Track>
              </ProgressBar>
            )
          ) : loadingList ? (
            <div className="flex flex-col gap-y-2 items-center mt-4">
              <Spinner size="lg" />
              <Description className="text-sm">Loading available python versions...</Description>
            </div>
          ) : isEmpty(searchVersions) ? (
            <EmptyStateCard
              className="mt-2"
              variant="secondary"
              icon={<Inbox size={34} />}
              description="Nothing to install!"
            />
          ) : (
            <div className="flex flex-col gap-y-1 my-2">
              {searchVersions.map(item => (
                <div
                  className={
                    'flex items-center justify-between hover:bg-surface-secondary/50' +
                    ' rounded-2xl px-2 py-1 transition-colors duration-200'
                  }
                  key={item.version}>
                  <Link onPress={() => window.open(item.url)}>
                    {item.version}
                    <Link.Icon />
                  </Link>
                  <Button size="sm" variant="secondary" onPress={() => installPython(item)}>
                    <DownloadMinimalistic />
                    Install
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
