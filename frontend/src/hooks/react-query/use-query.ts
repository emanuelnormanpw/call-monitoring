import {
  type QueryKey,
  useQuery as _useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';

import COOKIES_KEY from '@constants/cookies';
import type { ApiError } from '@models/api';
import type { CustomError } from '@utils/react-query';
import useCookie from '../use-cookie/use-cookie';
import type { QueryMeta } from './types';

const useQuery = <
  TQueryFnData = unknown,
  TError extends ApiError = ApiError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<
    TQueryFnData,
    CustomError<TError>,
    TData,
    TQueryKey
  > & { meta?: QueryMeta },
) => {
  const { meta, ...resOptions } = options;

  const { cookies } = useCookie();

  return _useQuery<TQueryFnData, CustomError<TError>, TData, TQueryKey>({
    meta: {
      ...meta,
      accessToken: cookies[COOKIES_KEY.AUTHORIZATION],
    },
    ...resOptions,
  });
};

export default useQuery;
