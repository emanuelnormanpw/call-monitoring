import { cn } from '@utils/cn';

import { SENTIMENT_FILTER_OPTIONS } from './constants';
import type { PropsType } from './types';

const Toolbar = (props: PropsType) => {
  const {
    search,
    sentiment,
    onSearchChange,
    onClearSearch,
    onSentimentChange,
  } = props;

  return (
    <div className="table-toolbar rounded-card border-border bg-card flex flex-col gap-3 border px-4 py-4 shadow-xs sm:flex-row sm:items-center sm:justify-between md:px-5">
      <div className="relative w-full sm:w-72">
        <input
          type="text"
          placeholder="Cari Call ID, CS, customer..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border-border bg-card text-ink placeholder:text-ink-3 focus:border-blue focus:ring-blue w-full rounded-[9px] border px-3.5 py-2 text-[13.5px] transition outline-none focus:ring-1"
        />
        {search && (
          <button
            type="button"
            onClick={onClearSearch}
            className="text-ink-3 hover:text-ink absolute top-1/2 right-2.5 -translate-y-1/2 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
        {SENTIMENT_FILTER_OPTIONS.map((opt) => {
          const isSelected = sentiment === opt.value;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSentimentChange(opt.value)}
              className={cn(
                'inline-flex h-9 cursor-pointer items-center justify-center rounded-[9px] border px-3 text-[13px] font-semibold whitespace-nowrap transition-colors select-none',
                isSelected
                  ? 'border-blue bg-blue-soft text-blue font-bold'
                  : 'border-border bg-card text-ink-2 hover:bg-row-hover',
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Toolbar;
