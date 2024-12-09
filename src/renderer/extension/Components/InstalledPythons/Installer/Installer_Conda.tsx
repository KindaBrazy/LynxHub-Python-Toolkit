import {Button, CircularProgress, Input, Popover, PopoverContent, PopoverTrigger, Progress} from '@nextui-org/react';
import {List, Tooltip} from 'antd';
import {isEmpty, isNil} from 'lodash';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';

import {pythonChannels} from '../../../../../cross/CrossExtensions';
import {useAppState} from '../../../../src/App/Redux/App/AppReducer';
import {getIconByName} from '../../../../src/assets/icons/SvgIconsContainer';

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

  useEffect(() => {
    console.log(envName);
  }, [envName]);

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

  return (
    <>
      {isEmpty(installingVersion) && (
        <div className="flex flex-row gap-x-2 px-4">
          <Input
            size="sm"
            type="search"
            value={inputValue}
            onValueChange={setInputValue}
            startContent={getIconByName('Circle')}
            placeholder="Search for python version..."
          />
          <Tooltip title="Refresh from server">
            <Button
              size="sm"
              variant="flat"
              onPress={() => fetchPythonList(true)}
              startContent={getIconByName('Refresh')}
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
          <CircularProgress
            size="lg"
            className="justify-self-center my-4"
            label="Loading available conda pythons..."
            classNames={{indicator: 'stroke-[#ffe66e]'}}
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
                        <Input size="sm" value={envName} onValueChange={setEnvName} placeholder="Environment name..." />
                        <Button size="sm" onPress={() => installPython(item)} fullWidth>
                          Install v{item}
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>,
                ]}
                className="hover:bg-foreground-100 transition-colors duration-150">
                <span className="">{item}</span>
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
