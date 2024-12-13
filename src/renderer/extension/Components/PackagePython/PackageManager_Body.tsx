import {CircularProgress, ModalBody} from '@nextui-org/react';
import {Empty, List} from 'antd';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';

import {PackageInfo} from '../../../../cross/CrossExtensions';
import {useAppState} from '../../../src/App/Redux/App/AppReducer';
import PackageItem from './PackageItem';

type Props = {
  searchData: PackageInfo[];
  isLoading: boolean;
};

export default function PackageManagerBody({searchData, isLoading}: Props) {
  const isDarkMode = useAppState('darkMode');

  return (
    <ModalBody
      options={{
        overflow: {x: 'hidden', y: 'scroll'},
        scrollbars: {
          autoHide: 'move',
          clickScroll: true,
          theme: isDarkMode ? 'os-theme-light' : 'os-theme-dark',
        },
      }}
      className="size-full p-4"
      as={OverlayScrollbarsComponent}>
      <div className="w-full flex flex-col gap-y-4">
        <div className="flex flex-row gap-8 flex-wrap justify-center">
          {isLoading ? (
            <CircularProgress
              size="lg"
              className="mb-4"
              classNames={{indicator: 'stroke-[#ffe66e]'}}
              label="Loading packages data, please wait..."
            />
          ) : (
            <List
              locale={{
                emptyText: <Empty description="No packages found." image={Empty.PRESENTED_IMAGE_SIMPLE} />,
              }}
              dataSource={searchData}
              className="w-full overflow-hidden"
              renderItem={item => <PackageItem item={item} />}
              bordered
            />
          )}
        </div>
      </div>
    </ModalBody>
  );
}
