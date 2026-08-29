import { useMemo, useState } from 'react';

import { useDebounce } from '@hooks';
import { useRGetCalls, type SentimentFilter } from '@repositories/calls';

import { buildPageNumbers } from './build-page-numbers';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  SEARCH_DEBOUNCE_MS,
} from './constants';

export const useDashboardCallMonitoring = () => {
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit] = useState(DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sentiment, setSentiment] = useState<SentimentFilter>('all');

  useDebounce(
    () => {
      setSearch(searchInput);
      setPage(DEFAULT_PAGE);
    },
    [searchInput],
    SEARCH_DEBOUNCE_MS,
  );

  const { data, isLoading, isError, error, refetch } = useRGetCalls({
    search,
    sentiment,
    page,
    limit,
  });

  const calls = data?.data ?? [];
  const totalData = data?.totalData ?? 0;
  const totalPages = Math.ceil(totalData / limit) || 1;
  const startEntry = totalData === 0 ? 0 : (page - 1) * limit + 1;
  const endEntry = Math.min(page * limit, totalData);

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

  const handlePageChange = (value: number) => setPage(value);

  const handleRetry = () => {
    refetch();
  };

  return {
    calls,
    endEntry,
    error,
    isError,
    isLoading,
    page,
    pageNumbers,
    searchInput,
    sentiment,
    startEntry,
    totalData,
    totalPages,
    handleClearSearch,
    handlePageChange,
    handleRetry,
    handleSearchChange,
    handleSentimentChange,
  };
};
