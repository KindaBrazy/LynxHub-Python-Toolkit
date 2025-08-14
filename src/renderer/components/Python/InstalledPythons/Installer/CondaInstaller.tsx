import {
  Button,
  CircularProgress,
  Input,
  Link,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  Spinner,
} from '@heroui/react';
import {List, Result, Tooltip} from 'antd';
import {isEmpty, isNil, isString} from 'lodash';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';

import {useAppState} from '../../../../../../../src/renderer/src/App/Redux/Reducer/AppReducer';
import {Circle_Icon, Refresh_Icon} from '../../../../../../../src/renderer/src/assets/icons/SvgIcons/SvgIcons';
import pIpc from '../../../../PIpc';
import {Warn_Icon} from '../../../SvgIcons';

const CACHE_KEY = 'available-conda-pythons-list';

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
    if (isOpen && isEmpty(versions)) fetchPythonList(false);
  }, [isOpen, versions]);

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
          console.log('result: ', result);
          localStorage.setItem(CACHE_KEY, JSON.stringify(result));
          const filteredVersions = result.filter(item => !installed.includes(item));
          setVersions(filteredVersions);
          setLoadingList(false);
          setErrorLoadingVersion(undefined);
        })
        .catch(e => {
          console.log('error: ', e);
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

    const cachedList = localStorage.getItem(CACHE_KEY);

    if (!refresh && !isNil(cachedList)) {
      const cachedVersions = (JSON.parse(cachedList) as string[]).filter(item => !installed.includes(item));

      if (isEmpty(cachedVersions)) {
        getFreshData();
      } else {
        setVersions(cachedVersions);
        setLoadingList(false);
      }
    } else {
      getFreshData();
    }
  };

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
      <Result
        extra={
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
        status="warning"
        className="text-center"
        title="Conda Installation Not Found"
        subTitle="To proceed, please install Conda from the official website."
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
              startContent={<Refresh_Icon />}
              onPress={() => fetchPythonList(true)}
              isIconOnly
            />
          </Tooltip>
        </div>
      )}
      {errorLoadingVersion ? (
        <div className="size-full py-2 px-16 text-danger flex flex-col items-center justify-center gap-4">
          <Warn_Icon className="size-20" />
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
            <List
              renderItem={item => (
                <List.Item
                  actions={[
                    <Popover key={'install_conda_python'}>
                      <PopoverTrigger>
                        <Button size="sm" variant="flat">
                          Install
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div className="px-2 py-1 space-y-2 text-center">
                          <Input
                            onKeyUp={(event: any) => {
                              if (event.key === 'Enter') {
                                installPython(item);
                              }
                            }}
                            size="sm"
                            value={envName}
                            onValueChange={setEnvName}
                            placeholder="Enter Conda environment name..."
                          />
                          <Button size="sm" onPress={() => installPython(item)} fullWidth>
                            Install v{item}
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>,
                  ]}
                  className="hover:bg-foreground-100 transition-colors duration-150">
                  <span>{item}</span>
                </List.Item>
              )}
              className="overflow-hidden"
              dataSource={searchVersions}
              bordered
            />
          )}
        </OverlayScrollbarsComponent>
      )}
    </>
  );
}
