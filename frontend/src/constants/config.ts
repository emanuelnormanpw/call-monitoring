const CONFIG = {
  API_BASE_PATH: String(import.meta.env.VITE_APP_API_BASE_PATH ?? '/api'),
  API_HOST: String(
    import.meta.env.VITE_APP_API_HOST ?? 'http://localhost:3000',
  ),
  API_TIMEOUT: Number(import.meta.env.VITE_APP_API_TIMEOUT ?? 5000),
  IS_MAINTENANCE:
    String(import.meta.env.VITE_APP_IS_MAINTENANCE ?? 'false') === 'true',
};

export const { API_BASE_PATH, API_HOST, API_TIMEOUT, IS_MAINTENANCE } = CONFIG;
export default CONFIG;
