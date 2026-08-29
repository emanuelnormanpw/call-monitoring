import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import dayjs from 'dayjs';

import { SentimentBadge } from '@elements';
import type { CallItem } from '@repositories/calls';

import { TIMESTAMP_FORMAT } from './constants';

const columnHelper = createColumnHelper<CallItem>();

export const useCallsColumns = () => {
  return useMemo(
    () => [
      columnHelper.accessor('callId', {
        header: 'Call ID',
        cell: (info) => (
          <span className="text-link font-mono text-[12.5px] font-semibold">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('csName', {
        header: 'CS Agent',
        cell: (info) => (
          <span className="text-ink font-medium">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('customerName', {
        header: 'Customer',
        cell: (info) => <span className="text-ink">{info.getValue()}</span>,
      }),
      columnHelper.accessor('sentimentScore', {
        header: 'Sentiment Score',
        cell: (info) => <SentimentBadge score={Number(info.getValue())} />,
      }),
      columnHelper.accessor('callTimestamp', {
        header: 'Timestamp',
        cell: (info) => (
          <span className="text-ink-2 text-[12.5px]">
            {dayjs(info.getValue()).format(TIMESTAMP_FORMAT)}
          </span>
        ),
      }),
    ],
    [],
  );
};
