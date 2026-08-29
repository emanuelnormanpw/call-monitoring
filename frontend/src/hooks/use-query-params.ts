import queryString from 'query-string';
import { useSearchParams } from 'react-router-dom';

export function useQueryParams<T>() {
  const [searchParams] = useSearchParams();
  return queryString.parse(searchParams.toString()) as T;
}

export default useQueryParams;
