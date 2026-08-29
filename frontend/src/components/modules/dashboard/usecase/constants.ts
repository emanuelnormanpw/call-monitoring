import type { SortingState } from '@tanstack/react-table';

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 5;
/** Pages shown on each side of the current page before a gap collapses. */
export const PAGINATION_SIBLING_COUNT = 1;
export const SEARCH_DEBOUNCE_MS = 400;
export const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const DATE_INPUT_FORMAT = 'YYYY-MM-DD';

/** The period filter may only reach back this many months from today. */
export const PERIOD_LIMIT_MONTHS = 3;

export const DEFAULT_SORTING: SortingState = [
  { id: 'callTimestamp', desc: true },
];
