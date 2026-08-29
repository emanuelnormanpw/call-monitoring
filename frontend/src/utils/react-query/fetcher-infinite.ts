import type { QueryKey } from '@tanstack/react-query';
import { API_BASE_PATH } from '@constants/config';
import type { QueryFunctionContext } from '@hooks/react-query';
import queryStringify from '../url/query-stringify';
import http from './http';
import type { InfiniteResult } from './model/fetcher-infinite';

/**
 * Fetcher helper for React Query infinite queries
 */
const fetcherInfinite = async (
  options: QueryFunctionContext<QueryKey, Record<string, unknown>>,
): Promise<InfiniteResult> => {
  const { queryKey = [], pageParam, meta = {} } = options;

  const { accessToken, apiVersion, basePath, disableCamelizeResponse } = meta;

  const version = apiVersion ? `/v${apiVersion}` : '';

  const [rpath, rparams] = queryKey;
  const rawPath = typeof rpath === 'string' ? rpath : '';
  const normalizedPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  const path = rawPath
    ? `${basePath ?? API_BASE_PATH}${version}${normalizedPath}`
    : '';

  let variables: Record<string, unknown>;
  if (pageParam) {
    variables = pageParam;
  } else {
    variables = rparams ? (rparams as Record<string, unknown>) : {};
  }

  const params = queryStringify(variables);
  const response = await http({
    path,
    params,
    accessToken,
    disableCamelizeResponse,
  });

  return Promise.resolve({ data: response, variables: variables });
};

export default fetcherInfinite;
