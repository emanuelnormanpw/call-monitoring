import { useId } from 'react';

import { Select } from '@elements/select';
import { cn } from '@utils/cn';

import {
  FIELD_CLASS,
  FIELD_LABEL_CLASS,
  INPUT_CLASS,
  SENTIMENT_FILTER_OPTIONS,
} from './constants';
import type { PropsType } from './types';

const Toolbar = (props: PropsType) => {
  const {
    search,
    sentiment,
    startDate,
    endDate,
    minDate,
    maxDate,
    onSearchChange,
    onClearSearch,
    onSentimentChange,
    onStartDateChange,
    onEndDateChange,
  } = props;

  const baseId = useId();

  const searchId = `${baseId}-search`;
  const sentimentId = `${baseId}-sentiment`;
  const startDateId = `${baseId}-start-date`;
  const endDateId = `${baseId}-end-date`;

  return (
    // Every field is full width on mobile. From 769px up the search keeps the
    // full row while the sentiment select takes the left half and the two
    // dates share the right half.
    <div className="table-toolbar rounded-card border-border bg-card grid grid-cols-12 gap-3 border px-4 py-4 shadow-xs md:px-5">
      <div className={cn(FIELD_CLASS, 'col-span-12')}>
        <label htmlFor={searchId} className={FIELD_LABEL_CLASS}>
          Pencarian
        </label>

        <div className="relative">
          <input
            id={searchId}
            type="text"
            placeholder="Cari Call ID, Nama CS, Nasabah ..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(INPUT_CLASS, 'pr-8')}
          />
          {search && (
            <button
              type="button"
              aria-label="Bersihkan pencarian"
              onClick={onClearSearch}
              className="text-ink-3 hover:text-ink absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="col-span-12 min-[769px]:col-span-6">
        <Select
          id={sentimentId}
          label="Sentimen"
          value={sentiment}
          options={SENTIMENT_FILTER_OPTIONS}
          onChange={onSentimentChange}
        />
      </div>

      <div className={cn(FIELD_CLASS, 'col-span-12 min-[769px]:col-span-3')}>
        <label htmlFor={startDateId} className={FIELD_LABEL_CLASS}>
          Tanggal Awal
        </label>
        <input
          id={startDateId}
          type="date"
          value={startDate}
          min={minDate}
          max={endDate || maxDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className={INPUT_CLASS}
        />
      </div>

      <div className={cn(FIELD_CLASS, 'col-span-12 min-[769px]:col-span-3')}>
        <label htmlFor={endDateId} className={FIELD_LABEL_CLASS}>
          Tanggal Akhir
        </label>
        <input
          id={endDateId}
          type="date"
          value={endDate}
          min={startDate || minDate}
          max={maxDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className={INPUT_CLASS}
        />
      </div>
    </div>
  );
};

export default Toolbar;
