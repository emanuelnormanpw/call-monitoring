const LoadingSpinner = () => {
  return (
    <span
      role="status"
      aria-label="Loading"
      className="border-t-primary border-border inline-block h-5 w-5 animate-spin rounded-full border-2"
    />
  );
};

export default LoadingSpinner;
