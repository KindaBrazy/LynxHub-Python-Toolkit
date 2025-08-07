import {Button, CircularProgress, Input, Link, Progress} from '@heroui/react';
import {List, message, Tooltip} from 'antd';
import {isEmpty, isNil, isString} from 'lodash';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';

import {formatSize} from '../../../../../../../src/cross/CrossUtils';
import {useAppState} from '../../../../../../../src/renderer/src/App/Redux/Reducer/AppReducer';
import {Circle_Icon, Refresh_Icon} from '../../../../../../../src/renderer/src/assets/icons/SvgIcons/SvgIcons';
import {DlProgressOfficial, PythonVersion} from '../../../../../cross/CrossExtTypes';
import pIpc from '../../../../PIpc';
import {Warn_Icon} from '../../../SvgIcons';

const CACHE_KEY = 'available-pythons-list';

type Props = {
  isOpen: boolean;
  closeModal: () => void;
  refresh: (research: boolean) => void;
  installed: string[];
  setCloseDisabled: Dispatch<SetStateAction<boolean>>;
};

export default function InstallerOfficial({refresh, installed, closeModal, isOpen, setCloseDisabled}: Props) {
  const isDarkMode = useAppState('darkMode');

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
    const cachedList = localStorage.getItem(CACHE_KEY);
    if (!refresh && !isNil(cachedList)) {
      setVersions((JSON.parse(cachedList) as PythonVersion[]).filter(item => !installed.includes(item.version)));
      setLoadingList(false);
    } else {
      pIpc
        .getAvailableOfficial()
        .then((result: PythonVersion[]) => {
          localStorage.setItem(CACHE_KEY, JSON.stringify(result));
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
  };

  useEffect(() => {
    if (isOpen && isEmpty(versions)) fetchPythonList(false);
  }, [isOpen, versions]);

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
        pIpc.off_DlProgressOfficial();
        pIpc.on_DlProgressOfficial((_, stage, progress) => {
          setInstallStage(stage);
          if (stage === 'downloading') {
            setDownloadProgress(progress);
          }
        });
        break;
      case 'linux':
        setInstallStage('installing');
        break;
    }

    pIpc
      .installOfficial(version)
      .then(() => {
        refresh(true);
        closeModal();
        console.log('installed', version);
        message.success(`Python${version.version} installed successfully.`);
      })
      .catch(err => {
        console.log(err);
        message.error(`Failed to install python${version.version}!`);
      })
      .finally(() => {
        setInstallingVersion(undefined);
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
            startContent={<Circle_Icon />}
            placeholder="Search for Python version to install..."
          />
          <Tooltip title="Refresh available Python versions">
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
        <div className="size-full py-2 text-danger flex flex-col items-center justify-center gap-4">
          <Warn_Icon className="size-20" />
          <span className="text-lg">{errorLoadingVersion.title}</span>
          <span className="text-warning text-sm">{errorLoadingVersion.description}</span>
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
          className={`pr-3 mr-1 pl-4 pb-4`}>
          {!isEmpty(installingVersion) ? (
            installStage === 'installing' ? (
              <Progress
                className="my-4 px-2"
                label={`Installing Python v${installingVersion?.version} ...`}
                isIndeterminate
              />
            ) : (
              <Progress
                className="my-4 px-2"
                value={(downloadProgress?.percentage || 0.1) * 100}
                classNames={{label: '!text-small', value: '!text-small'}}
                label={`Downloading ${installingVersion?.url.split('/').pop()} ...`}
                valueLabel={`${formatSize(downloadProgress?.downloaded)} / ${formatSize(downloadProgress?.total)}`}
                showValueLabel
              />
            )
          ) : loadingList ? (
            <CircularProgress
              size="lg"
              className="justify-self-center my-4"
              label="Loading available Python versions..."
              classNames={{indicator: 'stroke-[#ffe66e]'}}
            />
          ) : (
            <List
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button size="sm" variant="flat" key={'install_python'} onPress={() => installPython(item)}>
                      Install
                    </Button>,
                  ]}
                  className="hover:bg-foreground-100 transition-colors duration-150">
                  <Link size="sm" href={item.url} color="foreground" isExternal showAnchorIcon>
                    {item.version}
                  </Link>
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
