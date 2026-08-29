import type { PropsType } from './types';

const ErrorState = (props: PropsType) => {
  const { message, onRetry } = props;

  return (
    <div className="bg-card flex min-h-55 flex-col items-center justify-center p-8 text-center">
      <p className="text-danger-ink text-sm font-medium">
        Gagal memuat data panggilan: {message || 'Terjadi kesalahan'}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="border-border bg-card text-ink hover:bg-row-hover mt-3 rounded-[9px] border px-4 py-1.5 text-xs font-semibold transition-colors"
      >
        Coba Lagi
      </button>
    </div>
  );
};

export default ErrorState;
