import {Pagination} from '@heroui/react';
import {isEmpty} from 'lodash';
import {Dispatch, SetStateAction, useEffect, useMemo, useState} from 'react';

import {PackageInfo} from '../../../../../../cross/extension/CrossExtTypes';

type Props = {
  searchData: PackageInfo[];
  setItems: Dispatch<SetStateAction<PackageInfo[]>>;
};

export default function Footer_TablePage({searchData, setItems}: Props) {
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage] = useState(50);

  const pages = useMemo(() => Math.ceil(searchData.length / rowsPerPage), [searchData, rowsPerPage]);

  useEffect(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const data = searchData.slice(start, end);
    setItems(data);
  }, [page, searchData]);

  return (
    <div className="flex w-full justify-center absolute left-1/2 -translate-x-1/2">
      {!isEmpty(searchData) && (
        <Pagination size="lg" page={page} total={pages} color="secondary" onChange={setPage} isCompact showControls />
      )}
    </div>
  );
}
