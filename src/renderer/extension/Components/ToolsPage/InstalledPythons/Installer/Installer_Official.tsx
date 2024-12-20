import {Button, CircularProgress, Input, Link, Progress} from '@nextui-org/react';
import {List, Tooltip} from 'antd';
import {isEmpty, isNil} from 'lodash';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';

import {formatSize} from '../../../../../../cross/CrossUtils';
import {DlProgressOfficial, PythonVersion} from '../../../../../../cross/Extension/CrossExtTypes';
import {useAppState} from '../../../../../src/App/Redux/App/AppReducer';
import {Circle_Icon} from '../../../../../src/assets/icons/SvgIcons/SvgIcons1';
import {Refresh_Icon} from '../../../../../src/assets/icons/SvgIcons/SvgIcons2';
import pIpc from '../../../../PIpc';

const CACHE_KEY = 'available-pythons-list';

type Props = {
  isOpen: boolean;
  closeModal: () => void;
  refresh: () => void;
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

  const fetchPythonList = (refresh: boolean) => {
    setLoadingList(true);
    const cachedList = localStorage.getItem(CACHE_KEY);
    if (!refresh && !isNil(cachedList)) {
      setVersions((JSON.parse(cachedList) as PythonVersion[]).filter(item => !installed.includes(item.version)));
      setLoadingList(false);
    } else {
      pIpc.getAvailableOfficial().then((result: PythonVersion[]) => {
        localStorage.setItem(CACHE_KEY, JSON.stringify(result));
        const filteredVersions = result.filter(item => !installed.includes(item.version));
        setVersions(filteredVersions);
        setLoadingList(false);
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

    pIpc.off_DlProgressOfficial();
    pIpc.on_DlProgressOfficial((_, stage, progress) => {
      setInstallStage(stage);
      if (stage === 'downloading') {
        setDownloadProgress(progress);
      }
    });

    pIpc
      .installOfficial(version)
      .then(() => {
        refresh();
        closeModal();
        console.log('installed', version);
      })
      .catch(err => {
        console.log(err);
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
          installStage === 'installing' ? (
            <Progress
              className="my-4 px-2"
              label={`Installing Python v${installingVersion?.version}, Please wait...`}
              isIndeterminate
            />
          ) : (
            <Progress
              className="my-4 px-2"
              value={(downloadProgress?.percentage || 0.1) * 100}
              classNames={{label: '!text-small', value: '!text-small'}}
              label={`Downloading ${installingVersion?.url.split('/').pop()}, Please wait...`}
              valueLabel={`${formatSize(downloadProgress?.downloaded)} of ${formatSize(downloadProgress?.total)}`}
              showValueLabel
            />
          )
        ) : loadingList ? (
          <CircularProgress
            size="lg"
            className="justify-self-center my-4"
            label="Loading available pythons..."
            classNames={{indicator: 'stroke-[#ffe66e]'}}
          />
        ) : (
          <List
            renderItem={item => (
              <List.Item
                actions={[
                  <Button size="sm" variant="faded" key={'install_python'} onPress={() => installPython(item)}>
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
    </>
  );
}
