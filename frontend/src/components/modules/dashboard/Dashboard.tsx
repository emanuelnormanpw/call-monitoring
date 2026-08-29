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
  } = useDashboardCallMonitoring();

  const table = useCallsTable(calls);

  const isEmpty = calls.length === 0;

  return (
    <div className="outer-table w-full max-w-full space-y-4">
      <Header title="Call Monitoring" />

      <Toolbar
        search={searchInput}
        sentiment={sentiment}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        onSentimentChange={handleSentimentChange}
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
