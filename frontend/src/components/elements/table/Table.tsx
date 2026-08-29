import { flexRender } from '@tanstack/react-table';

import { cn } from '@utils/cn';

import { SORT_INDICATOR } from './constants';
import type { PropsType } from './types';

const Table = (props: PropsType) => {
  const { table } = props;

  return (
    <div className="table-container block max-w-full overflow-x-auto whitespace-nowrap">
      <table className="text-ink table w-full border-collapse text-[13.5px]">
        <thead className="bg-row-hover text-left">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-border border-b">
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sortDirection = header.column.getIsSorted();

                return (
                  <th
                    key={header.id}
                    aria-sort={
                      sortDirection === 'asc'
                        ? 'ascending'
                        : sortDirection === 'desc'
                          ? 'descending'
                          : 'none'
                    }
                    className="text-ink-2 px-4 py-3.25 text-left text-[11.5px] font-bold tracking-[0.02em] whitespace-nowrap uppercase"
                  >
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className={cn(
                          'hover:text-ink inline-flex cursor-pointer items-center gap-1.5 transition-colors select-none',
                          sortDirection && 'text-blue',
                        )}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        <span aria-hidden="true" className="text-[10px]">
                          {SORT_INDICATOR[sortDirection || 'none']}
                        </span>
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-border-2 hover:bg-row-hover cursor-pointer border-b transition-colors last:border-b-0"
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="text-ink px-4 py-3.25 text-left align-middle text-[13.5px] font-normal whitespace-nowrap"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
