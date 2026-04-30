import {
  Button,
  Description,
  Input,
  Label,
  Link,
  Popover,
  ProgressBar,
  SearchField,
  Spinner,
  UseOverlayStateReturn,
} from '@heroui-v3/react';
import EmptyStateCard from '@lynx/components/EmptyStateCard';
import LynxTooltip from '@lynx/components/LynxTooltip';
import {DownloadMinimalistic, Inbox} from '@solar-icons/react-perf/BoldDuotone';
import {Refresh, ShieldWarning} from '@solar-icons/react-perf/BoldDuotone';
import {isEmpty, isNil, isString} from 'lodash-es';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';

import pIpc from '../../../../PIpc';

type Props = {
  state: UseOverlayStateReturn;
  refresh: (research: boolean) => void;
  installed: string[];
  setCloseDisabled: Dispatch<SetStateAction<boolean>>;
};

export default function InstallerConda({refresh, installed, state, setCloseDisabled}: Props) {
  const [versions, setVersions] = useState<string[]>([]);
  const [searchVersions, setSearchVersions] = useState<string[]>([]);

  const [inputValue, setInputValue] = useState<string>('');
  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [installingVersion, setInstallingVersion] = useState<string>('');
  const [percentage, setPercentage] = useState<number>(0);
  const [envName, setEnvName] = useState<string>('');
  const [isCondaInstalled, setIsCondaInstalled] = useState<boolean | undefined>(undefined);
  const [errorLoadingVersion, setErrorLoadingVersion] = useState<{title: string; description: string} | undefined>({
    title: 'Failed to fetch available Python versions',
    description:
      'Please check your internet connection and try again.' +
      ' If the problem persists, please open an issue on GitHub.',
  });

  useEffect(() => {
    pIpc.isCondaInstalled().then(result => {
      setIsCondaInstalled(result);
    });
  }, []);

  useEffect(() => {
    if (isEmpty(inputValue)) {
      setSearchVersions(versions);
    } else {
      setSearchVersions(versions.filter(version => version.startsWith(inputValue)));
    }
  }, [inputValue, versions]);

  const fetchPythonList = (refresh: boolean) => {
    setErrorLoadingVersion(undefined);

    const getFreshData = () => {
      pIpc
        .getAvailableConda()
        .then((result: string[]) => {
          pIpc.storage.setAvailableConda(result);

          const filteredVersions = result.filter(item => !installed.includes(item));
          setVersions(filteredVersions);
          setLoadingList(false);
          setErrorLoadingVersion(undefined);
        })
        .catch(e => {
          console.error('error getting fresh conda list: ', e);
          if (e.message && isString(e.message)) {
            setErrorLoadingVersion({title: 'Failed to fetch available Python versions', description: e.message});
          } else {
            setErrorLoadingVersion({
              title: 'Failed to fetch available Python versions',
              description:
                'Please check your internet connection and validate conda.' +
                ' If the problem persists, please open an issue on GitHub.',
            });
          }
        });
    };

    setLoadingList(true);

    pIpc.storage
      .getAvailableConda()
      .then(cachedList => {
        if (!refresh && (!isNil(cachedList) || !isEmpty(cachedList))) {
          const cachedVersions = cachedList.filter(item => !installed.includes(item));

          if (isEmpty(cachedVersions)) {
            getFreshData();
          } else {
            setVersions(cachedVersions);
            setLoadingList(false);
          }
        } else {
          getFreshData();
        }
      })
      .catch(e => {
        console.error('Failed to get cached conda list', e);
        getFreshData();
      });
  };

  useEffect(() => {
    if (state.isOpen) fetchPythonList(false);
  }, [state.isOpen]);

  const installPython = (version: string) => {
    setInstallingVersion(version);
    setCloseDisabled(true);

    pIpc.off_DlProgressConda();
    pIpc.on_DlProgressConda((_, progress) => {
      setPercentage(progress);
    });

    pIpc
      .installConda(envName, version)
      .then(() => {
        refresh(true);
        state.close();
        console.log('installed', version);
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        setInstallingVersion('');
        setCloseDisabled(false);
      });
  };

  if (isCondaInstalled === undefined) {
    return (
      <div className="flex flex-col gap-y-2 items-center mt-2">
        <Spinner size="lg" />
        <Description className="text-sm">Checking for conda installation...</Description>
      </div>
    );
  } else if (!isCondaInstalled) {
    return (
      <EmptyStateCard
        action={
          <Link
            onPress={() => window.open('https://docs.conda.io/projects/conda/en/latest/user-guide/install/index.html')}>
            Conda Official Website
            <Link.Icon />
          </Link>
        }
        variant="secondary"
        className="mx-4 mt-2"
        title="Conda Installation Not Found!"
        description="To proceed, please install Conda from the official website."
      />
    );
  }

  return (
    <>
      {isEmpty(installingVersion) && (
        <div className="flex flex-row gap-x-2 px-4 mt-1">
          <SearchField value={inputValue} variant="secondary" onChange={setInputValue} fullWidth>
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <LynxTooltip delay={300} content="Refresh from server">
            <Button variant="tertiary" className="shrink-0" onPress={() => fetchPythonList(true)} isIconOnly>
              <Refresh />
            </Button>
          </LynxTooltip>
        </div>
      )}

      {errorLoadingVersion ? (
        <EmptyStateCard
          variant="secondary"
          className="mt-2 mx-4"
          title={errorLoadingVersion.title}
          description={errorLoadingVersion.description}
          icon={<ShieldWarning className="size-20 text-warning" />}
        />
      ) : (
        <div className="px-4">
          {!isEmpty(installingVersion) ? (
            <ProgressBar className="my-4" value={percentage} isIndeterminate={percentage === 0 || percentage === 100}>
              <Label>Installing Conda Python v{installingVersion}...</Label>
              <ProgressBar.Output />
              <ProgressBar.Track>
                <ProgressBar.Fill />
              </ProgressBar.Track>
            </ProgressBar>
          ) : loadingList ? (
            <div className="flex flex-col gap-y-2 items-center mt-2">
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
                  key={item}>
                  <Label>{item}</Label>
                  <Popover>
                    <Button size="sm" variant="secondary">
                      <DownloadMinimalistic />
                      Install
                    </Button>
                    <Popover.Content className="max-w-64">
                      <Popover.Dialog className="gap-y-2 flex flex-col">
                        <Popover.Arrow />
                        <Input
                          onKeyUp={(event: any) => {
                            if (event.key === 'Enter') {
                              installPython(item);
                            }
                          }}
                          value={envName}
                          variant="secondary"
                          placeholder="Environment name..."
                          onChange={e => setEnvName(e.target.value)}
                        />
                        <Button size="sm" onPress={() => installPython(item)} fullWidth>
                          <DownloadMinimalistic />
                          Install v{item}
                        </Button>
                      </Popover.Dialog>
                    </Popover.Content>
                  </Popover>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
