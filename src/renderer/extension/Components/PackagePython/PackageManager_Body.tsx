import {CircularProgress, ModalBody, Spinner} from '@nextui-org/react';
import {Empty, List} from 'antd';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';

import {PackageInfo} from '../../../../cross/CrossExtensions';
import {useAppState} from '../../../src/App/Redux/App/AppReducer';
import PackageItem from './PackageItem';

type Props = {
  searchData: PackageInfo[];
  isLoading: boolean;
  pythonPath: string;
  updated: (name: string, newVersion: string) => void;
  removed: (name: string) => void;
};

export default function PackageManagerBody({searchData, isLoading, pythonPath, updated, removed}: Props) {
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
            <Spinner
              size="lg"
              className="mb-4"
              label="Loading packages data, please wait..."
              classNames={{circle2: 'border-b-[#ffe66e]', circle1: 'border-b-[#ffe66e] '}}
            />
          ) : (
            <List
              locale={{
                emptyText: <Empty description="No packages found." image={Empty.PRESENTED_IMAGE_SIMPLE} />,
              }}
              renderItem={item => (
                <PackageItem item={item} removed={removed} updated={updated} pythonPath={pythonPath} />
              )}
              dataSource={searchData}
              className="w-full overflow-hidden"
              bordered
            />
          )}
        </div>
      </div>
    </ModalBody>
  );
}
