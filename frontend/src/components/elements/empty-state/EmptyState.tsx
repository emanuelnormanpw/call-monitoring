const EmptyState = () => {
  return (
    <div className="empty-table bg-card flex min-h-60 flex-1 flex-col items-center justify-center py-12">
      <div className="empty-table_illustration bg-blue-soft text-blue mb-3 flex items-center justify-center rounded-full p-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="36"
          height="36"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.75"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
          />
        </svg>
      </div>
      <p className="text-ink text-[16px] font-bold">Data tidak ditemukan</p>
      <p className="text-ink-2 mt-1 text-[13px]">
        Belum ada data riwayat panggilan yang sesuai dengan filter.
      </p>
    </div>
  );
};

export default EmptyState;
