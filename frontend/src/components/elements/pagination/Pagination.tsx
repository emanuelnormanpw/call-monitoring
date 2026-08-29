import { cn } from '@utils/cn';

import { PAGE_ELLIPSIS } from './constants';
import type { PaginationProps } from './types';

const BUTTON_BASE_CLASS =
  'pagination-button inline-flex cursor-pointer items-center justify-center rounded-lg border px-[11px] py-1.5 text-[13px] transition-colors';
const BUTTON_IDLE_CLASS =
  'border-border bg-card text-ink-2 hover:bg-row-hover disabled:pointer-events-none disabled:opacity-40';

const Pagination = (props: PaginationProps) => {
  const {
    page,
    totalPages,
    pageNumbers,
    startEntry,
    endEntry,
    totalData,
    onPageChange,
  } = props;

  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  return (
    <div className="table-action border-border bg-card flex w-full flex-wrap items-center justify-between gap-2.5 border-t px-[18px] py-[13px]">
      <span className="page-info text-ink-3 text-[12.5px] whitespace-nowrap">
        Menampilkan {startEntry}–{endEntry} dari {totalData} data
      </span>

      <div className="pagination flex items-center justify-center gap-1">
        <button
          type="button"
          disabled={isFirstPage}
          onClick={() => onPageChange(1)}
          className={cn(BUTTON_BASE_CLASS, BUTTON_IDLE_CLASS)}
        >
          Pertama
        </button>

        <button
          type="button"
          disabled={isFirstPage}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className={cn(BUTTON_BASE_CLASS, BUTTON_IDLE_CLASS)}
          aria-label="Previous page"
        >
          ‹
        </button>

        {pageNumbers.map((item, index) =>
          item === PAGE_ELLIPSIS ? (
            <span
              key={`${PAGE_ELLIPSIS}-${index}`}
              aria-hidden="true"
              className="text-ink-3 px-1 text-[13px] select-none"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onPageChange(item)}
              className={cn(
                BUTTON_BASE_CLASS,
                item === page
                  ? 'border-blue bg-blue-soft text-blue px-[12px] font-bold'
                  : BUTTON_IDLE_CLASS,
              )}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          disabled={isLastPage}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          className={cn(BUTTON_BASE_CLASS, BUTTON_IDLE_CLASS)}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default Pagination;
