import { type UseQueryOptions, useQueryParams, useQuery } from '@hooks';
import type { ApiError } from '@models/api';
import type { TableQuery } from '@repositories/common';

import {
  GET_CALLS_KEY,
  type CallsResponse,
  type CallsQueryParam,
} from '../models';

export function useRGetCalls(
  options: UseQueryOptions<CallsResponse, ApiError> & CallsQueryParam = {},
) {
  const queryParams = useQueryParams<TableQuery>();
  const {
    search,
    sentiment,
    page: pageOverride,
    limit: limitOverride,
    ...resOptions
  } = options;

  const resolvedSentiment =
    sentiment && sentiment !== 'all' ? sentiment : undefined;

  return useQuery<CallsResponse, ApiError>({
    queryKey: [
      ...GET_CALLS_KEY,
      {
        limit:
          limitOverride ?? (queryParams.limit ? Number(queryParams.limit) : 5),
        page: pageOverride ?? (queryParams.page ? Number(queryParams.page) : 1),
        search: search || undefined,
        sentiment: resolvedSentiment,
      },
    ],
    staleTime: 1000 * 60 * 5,
    ...resOptions,
  });
}

export default useRGetCalls;
