import { useMemo, useState } from 'react';
import type { OnChangeFn, SortingState } from '@tanstack/react-table';
import dayjs from 'dayjs';
import humps from 'humps';

import { useDebounce } from '@hooks';
import {
  useRGetCalls,
  type SentimentFilter,
  type SortDirection,
} from '@repositories/calls';

import { buildPageNumbers } from './build-page-numbers';
import {
  DATE_INPUT_FORMAT,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORTING,
  PERIOD_LIMIT_MONTHS,
  SEARCH_DEBOUNCE_MS,
} from './constants';

export const useDashboardCallMonitoring = () => {
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit] = useState(DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sentiment, setSentiment] = useState<SentimentFilter>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sorting, setSorting] = useState<SortingState>(DEFAULT_SORTING);

  useDebounce(
    () => {
      setSearch(searchInput);
      setPage(DEFAULT_PAGE);
    },
    [searchInput],
    SEARCH_DEBOUNCE_MS,
  );

  // Column ids are camelCase in the table but snake_case on the wire.
  const activeSort = sorting[0];
  const sortBy = activeSort ? humps.decamelize(activeSort.id) : undefined;
  const sortDir: SortDirection | undefined = activeSort
    ? activeSort.desc
      ? 'desc'
      : 'asc'
    : undefined;

  const { data, isLoading, isError, error, refetch } = useRGetCalls({
    search,
    sentiment,
    startDate,
    endDate,
    sortBy,
    sortDir,
    page,
    limit,
  });

  const calls = data?.data ?? [];
  const totalData = data?.totalData ?? 0;
  const totalPages = Math.ceil(totalData / limit) || 1;
  const startEntry = totalData === 0 ? 0 : (page - 1) * limit + 1;
  const endEntry = Math.min(page * limit, totalData);
  const maxDate = dayjs().format(DATE_INPUT_FORMAT);
  const minDate = dayjs()
    .subtract(PERIOD_LIMIT_MONTHS, 'month')
    .format(DATE_INPUT_FORMAT);

  const pageNumbers = useMemo(
    () => buildPageNumbers(page, totalPages),
    [page, totalPages],
  );

  const handleSearchChange = (value: string) => setSearchInput(value);

  const handleClearSearch = () => setSearchInput('');

  const handleSentimentChange = (value: SentimentFilter) => {
    setSentiment(value);
    setPage(DEFAULT_PAGE);
  };

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    setPage(DEFAULT_PAGE);
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    setPage(DEFAULT_PAGE);
  };

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSorting((prev) =>
      typeof updater === 'function' ? updater(prev) : updater,
    );
    setPage(DEFAULT_PAGE);
  };

  const handlePageChange = (value: number) => setPage(value);

  const handleRetry = () => {
    refetch();
  };

  return {
    calls,
    endDate,
    endEntry,
    error,
    isError,
    isLoading,
    maxDate,
    minDate,
    page,
    pageNumbers,
    searchInput,
    sentiment,
    sorting,
    startDate,
    startEntry,
    totalData,
    totalPages,
    handleClearSearch,
    handleEndDateChange,
    handlePageChange,
    handleRetry,
    handleSearchChange,
    handleSentimentChange,
    handleSortingChange,
    handleStartDateChange,
  };
};
