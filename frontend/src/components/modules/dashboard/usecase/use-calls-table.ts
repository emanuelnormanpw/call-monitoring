import { getCoreRowModel, useReactTable } from '@tanstack/react-table';

import type { CallItem } from '@repositories/calls';

import { useCallsColumns } from './use-calls-columns';

export const useCallsTable = (data: CallItem[]) => {
  const columns = useCallsColumns();

  return useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
};
