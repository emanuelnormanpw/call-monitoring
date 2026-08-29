import { flexRender } from '@tanstack/react-table';

import type { PropsType } from './types';

const Table = (props: PropsType) => {
  const { table } = props;

  return (
    <div className="table-container block max-w-full overflow-x-auto whitespace-nowrap">
      <table className="text-ink table w-full border-collapse text-[13.5px]">
        <thead className="bg-row-hover text-left">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-border border-b">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="text-ink-2 px-4 py-3.25 text-left text-[11.5px] font-bold tracking-[0.02em] whitespace-nowrap uppercase"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
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
