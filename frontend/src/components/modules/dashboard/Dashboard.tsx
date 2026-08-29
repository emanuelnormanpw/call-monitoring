import {
  EmptyState,
  ErrorState,
  LoadingState,
  Pagination,
  Table,
  Toolbar,
} from '@elements';
import { Header } from '@layouts';

import { useCallsTable, useDashboardCallMonitoring } from './usecase';

const Dashboard = () => {
  const {
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
  } = useDashboardCallMonitoring();

  const table = useCallsTable({
    data: calls,
    sorting,
    onSortingChange: handleSortingChange,
  });

  const isEmpty = calls.length === 0;

  return (
    <div className="outer-table w-full max-w-full space-y-4">
      <Header title="Call Monitoring" />

      <Toolbar
        search={searchInput}
        sentiment={sentiment}
        startDate={startDate}
        endDate={endDate}
        minDate={minDate}
        maxDate={maxDate}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        onSentimentChange={handleSentimentChange}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
      />

      <div className="table-surface rounded-card border-border bg-card overflow-hidden border shadow-xs">
        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState message={error?.message} onRetry={handleRetry} />
        ) : isEmpty ? (
          <EmptyState />
        ) : (
          <>
            <Table table={table} />
            <Pagination
              page={page}
              totalPages={totalPages}
              pageNumbers={pageNumbers}
              startEntry={startEntry}
              endEntry={endEntry}
              totalData={totalData}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
