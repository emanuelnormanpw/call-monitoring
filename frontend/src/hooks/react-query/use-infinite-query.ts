import {
  type QueryKey,
  useInfiniteQuery as _useInfiniteQuery,
  type UseInfiniteQueryOptions,
  type InfiniteData,
} from '@tanstack/react-query';

import COOKIES_KEY from '@constants/cookies';
import type { ApiError } from '@models/api';
import type { CustomError } from '@utils/react-query';
import useCookie from '../use-cookie/use-cookie';
import type { QueryMeta } from './types';

const useInfiniteQuery = <
  TQueryFnData,
  TError extends ApiError = ApiError,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  options: UseInfiniteQueryOptions<
    TQueryFnData,
    CustomError<TError>,
    TData,
    TQueryKey,
    TPageParam
  > & { meta?: QueryMeta },
) => {
  const { meta, ...resOptions } = options;
  const { cookies } = useCookie();

  return _useInfiniteQuery<
    TQueryFnData,
    CustomError<TError>,
    TData,
    TQueryKey,
    TPageParam
  >({
    meta: {
      ...meta,
      accessToken: cookies[COOKIES_KEY.AUTHORIZATION],
    },
    ...resOptions,
  });
};

export default useInfiniteQuery;
