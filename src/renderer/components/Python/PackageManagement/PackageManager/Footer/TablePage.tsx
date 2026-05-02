import {Pagination} from '@heroui-v3/react';
import {isEmpty} from 'lodash-es';
import {Dispatch, SetStateAction, useEffect, useMemo, useState} from 'react';

import {PackageInfo} from '../../../../../../cross/CrossExtTypes';

type Props = {
  searchData: PackageInfo[];
  setItems: Dispatch<SetStateAction<PackageInfo[]>>;
};

export default function TablePage({searchData, setItems}: Props) {
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
        <Pagination className="justify-center">
          <Pagination.Content>
            <Pagination.Item>
              <Pagination.Previous isDisabled={page === 1} onPress={() => setPage(p => p - 1)}>
                <Pagination.PreviousIcon />
                <span>Previous</span>
              </Pagination.Previous>
            </Pagination.Item>
            {Array.from({length: pages}, (_, i) => i + 1).map(p => (
              <Pagination.Item key={p}>
                <Pagination.Link isActive={p === page} onPress={() => setPage(p)}>
                  {p}
                </Pagination.Link>
              </Pagination.Item>
            ))}
            <Pagination.Item>
              <Pagination.Next isDisabled={page === pages} onPress={() => setPage(p => p + 1)}>
                <span>Next</span>
                <Pagination.NextIcon />
              </Pagination.Next>
            </Pagination.Item>
          </Pagination.Content>
        </Pagination>
      )}
    </div>
  );
}
