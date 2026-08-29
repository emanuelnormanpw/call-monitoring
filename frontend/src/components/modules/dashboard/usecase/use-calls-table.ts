import {
  getCoreRowModel,
  useReactTable,
  type OnChangeFn,
  type SortingState,
} from '@tanstack/react-table';

import type { CallItem } from '@repositories/calls';

import { useCallsColumns } from './use-calls-columns';

interface UseCallsTableOptions {
  data: CallItem[];
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
}

export const useCallsTable = (options: UseCallsTableOptions) => {
  const { data, sorting, onSortingChange } = options;

  const columns = useCallsColumns();

  return useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    enableSortingRemoval: false,
    sortDescFirst: false,
    state: { sorting },
    onSortingChange,
  });
};
