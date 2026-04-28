import {
  Button,
  CircularProgress,
  Input,
  Link,
  Listbox,
  ListboxItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  Spinner,
  Tooltip,
} from '@heroui/react';
import EmptyStateCard from '@lynx/components/EmptyStateCard';
import {DownloadMinimalistic} from '@solar-icons/react-perf/BoldDuotone';
import {Refresh, ShieldWarning} from '@solar-icons/react-perf/BoldDuotone';
import {isEmpty, isNil, isString} from 'lodash-es';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';

import {useAppState} from '../../../../../../../src/renderer/mainWindow/redux/reducers/app';
import {Circle_Icon} from '../../../../../../../src/renderer/shared/assets/icons';
import pIpc from '../../../../PIpc';

type Props = {
  isOpen: boolean;
  closeModal: () => void;
  refresh: (research: boolean) => void;
  installed: string[];
  setCloseDisabled: Dispatch<SetStateAction<boolean>>;
};

export default function InstallerConda({refresh, installed, closeModal, isOpen, setCloseDisabled}: Props) {
  const isDarkMode = useAppState('darkMode');

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
    if (isOpen) fetchPythonList(false);
  }, [isOpen]);

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
        closeModal();
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
    return <CircularProgress size="lg" className="mb-4 self-center" label="Checking for Conda installation..." />;
  } else if (!isCondaInstalled) {
    return (
      <EmptyStateCard
        action={
          <Link
            as={Button}
            variant="flat"
            color="foreground"
            onPress={() => window.open('https://docs.conda.io/projects/conda/en/latest/user-guide/install/index.html')}
            isExternal
            showAnchorIcon>
            Conda Official Website
          </Link>
        }
        className="mx-4"
        description="To proceed, please install Conda from the official website."
        title={<span className="text-warning font-bold">Conda Installation Not Found</span>}
      />
    );
  }

  return (
    <>
      {isEmpty(installingVersion) && (
        <div className="flex flex-row gap-x-2 px-4">
          <Input
            size="sm"
            type="search"
            value={inputValue}
            onValueChange={setInputValue}
            startContent={<Circle_Icon />}
            placeholder="Refresh available Conda Python versions"
          />
          <Tooltip title="Refresh from server">
            <Button
              size="sm"
              variant="flat"
              startContent={<Refresh />}
              onPress={() => fetchPythonList(true)}
              isIconOnly
            />
          </Tooltip>
        </div>
      )}
      {errorLoadingVersion ? (
        <div className="size-full py-2 px-16 text-danger flex flex-col items-center justify-center gap-4">
          <ShieldWarning className="size-20" />
          <span className="text-lg">{errorLoadingVersion.title}</span>
          <span className="text-warning/50 text-sm">{errorLoadingVersion.description}</span>
        </div>
      ) : (
        <OverlayScrollbarsComponent
          options={{
            overflow: {x: 'hidden', y: 'scroll'},
            scrollbars: {
              autoHide: 'move',
              clickScroll: true,
              theme: isDarkMode ? 'os-theme-light' : 'os-theme-dark',
            },
          }}
          className={`pr-3 mr-1 pl-4 pb-4 text-center`}>
          {!isEmpty(installingVersion) ? (
            <Progress
              value={percentage}
              className="my-4 px-2"
              isIndeterminate={percentage === 0 || percentage === 100}
              label={`Installing Conda Python v${installingVersion}...`}
              showValueLabel
            />
          ) : loadingList ? (
            <Spinner
              size="lg"
              className="justify-self-center my-4"
              label="Loading available Python versions..."
              classNames={{circle2: 'border-b-[#ffe66e]', circle1: 'border-b-[#ffe66e] '}}
            />
          ) : (
            <Listbox variant="flat" className="px-4" selectionMode="none">
              {searchVersions.map(item => (
                <ListboxItem
                  endContent={
                    <Popover key={'install_conda_python'} showArrow>
                      <PopoverTrigger>
                        <Button size="sm" variant="flat" color="success" startContent={<DownloadMinimalistic />}>
                          Install
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-3">
                        <div className="px-2 py-1 space-y-2 text-center">
                          <Input
                            onKeyUp={(event: any) => {
                              if (event.key === 'Enter') {
                                installPython(item);
                              }
                            }}
                            value={envName}
                            onValueChange={setEnvName}
                            placeholder="Environment name..."
                          />
                          <Button
                            size="sm"
                            color="success"
                            onPress={() => installPython(item)}
                            startContent={<DownloadMinimalistic />}
                            fullWidth>
                            Install v{item}
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  }
                  key={item}
                  className="cursor-default">
                  {item}
                </ListboxItem>
              ))}
            </Listbox>
          )}
        </OverlayScrollbarsComponent>
      )}
    </>
  );
}
