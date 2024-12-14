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
} from '@nextui-org/react';
import {List, Result, Tooltip} from 'antd';
import {isEmpty, isNil} from 'lodash';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';

import {pythonChannels} from '../../../../../../cross/CrossExtensions';
import {useAppState} from '../../../../../src/App/Redux/App/AppReducer';
import {Circle_Icon} from '../../../../../src/assets/icons/SvgIcons/SvgIcons1';
import {Refresh_Icon} from '../../../../../src/assets/icons/SvgIcons/SvgIcons2';

const CACHE_KEY = 'available-conda-pythons-list';

type Props = {
  isOpen: boolean;
  closeModal: () => void;
  refresh: () => void;
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

  useEffect(() => {
    window.electron.ipcRenderer.invoke(pythonChannels.isCondaInstalled).then(result => {
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
    setLoadingList(true);
    const cachedList = localStorage.getItem(CACHE_KEY);
    if (!refresh && !isNil(cachedList)) {
      setVersions((JSON.parse(cachedList) as string[]).filter(item => !installed.includes(item)));
      setLoadingList(false);
    } else {
      window.electron.ipcRenderer.invoke(pythonChannels.getAvailableConda).then((result: string[]) => {
        localStorage.setItem(CACHE_KEY, JSON.stringify(result));
        const filteredVersions = result.filter(item => !installed.includes(item));
        setVersions(filteredVersions);
        setLoadingList(false);
      });
    }
  };

  const installPython = (version: string) => {
    setInstallingVersion(version);
    setCloseDisabled(true);

    window.electron.ipcRenderer.removeAllListeners(pythonChannels.downloadProgressConda);
    window.electron.ipcRenderer.on(pythonChannels.downloadProgressConda, (_e, progress: number) => {
      console.log(progress);
      setPercentage(progress);
    });

    window.electron.ipcRenderer
      .invoke(pythonChannels.installConda, envName, version)
      .then(() => {
        refresh();
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
    return (
      <CircularProgress
        size="lg"
        className="mb-4 self-center"
        label="Please wait. Checking for Conda installation before proceeding..."
      />
    );
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
            Official Website
          </Link>
        }
        status="warning"
        className="text-center"
        title="Conda is Not Installed"
        subTitle="Conda is required. Please install it from the official website."
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
            placeholder="Search for python version..."
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
      <OverlayScrollbarsComponent
        options={{
          overflow: {x: 'hidden', y: 'scroll'},
          scrollbars: {
            autoHide: 'move',
            clickScroll: true,
            theme: isDarkMode ? 'os-theme-light' : 'os-theme-dark',
          },
        }}
        className={`pr-3 mr-1 pl-4 pb-4`}>
        {!isEmpty(installingVersion) ? (
          <Progress
            value={percentage}
            className="my-4 px-2"
            label={`Installing Python v${installingVersion}...`}
            isIndeterminate={percentage === 0 || percentage === 100}
            showValueLabel
          />
        ) : loadingList ? (
          <Spinner
            size="lg"
            className="justify-self-center my-4"
            label="Loading available conda pythons..."
            classNames={{circle2: 'border-b-[#ffe66e]', circle1: 'border-b-[#ffe66e] '}}
          />
        ) : (
          <List
            renderItem={item => (
              <List.Item
                actions={[
                  <Popover key={'install_conda_python'}>
                    <PopoverTrigger>
                      <Button size="sm" variant="faded">
                        Install
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="px-2 py-1 space-y-2 text-center">
                        <Input
                          onKeyUp={event => {
                            if (event.key === 'Enter') {
                              installPython(item);
                            }
                          }}
                          size="sm"
                          value={envName}
                          onValueChange={setEnvName}
                          placeholder="Environment name..."
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
    </>
  );
}
