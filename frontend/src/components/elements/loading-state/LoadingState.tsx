const LoadingState = () => {
  return (
    <div className="loading-table bg-card flex min-h-[240px] flex-1 flex-col items-center justify-center py-12">
      <div className="border-blue h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
      <p className="text-ink-2 mt-3 text-sm font-medium">
        Memuat data panggilan...
      </p>
    </div>
  );
};

export default LoadingState;
