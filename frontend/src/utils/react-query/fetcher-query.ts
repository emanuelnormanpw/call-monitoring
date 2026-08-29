import { API_BASE_PATH } from '@constants/config';
import type { QueryFunctionContext } from '@hooks/react-query';

import { queryStringify } from '../url';
import http from './http';

/**
 * Default TanStack Query fetcher function
 */
const fetcherQuery = async (options: QueryFunctionContext) => {
  const { queryKey = [], meta = {} } = options;

  const { accessToken, apiVersion, basePath, disableCamelizeResponse } = meta;

  const version = apiVersion ? `/v${apiVersion}` : '';

  const [rpath, rparams] = queryKey;
  const rawPath = typeof rpath === 'string' ? rpath : '';
  const normalizedPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  const base = basePath ?? API_BASE_PATH;
  const path = rawPath ? `${base}${version}${normalizedPath}` : '';
  const params = rparams ? (rparams as Record<string, unknown>) : {};
  const pstring = queryStringify(params);

  const response = await http({
    path,
    params: pstring,
    accessToken,
    disableCamelizeResponse,
  });
  return Promise.resolve(response);
};

export default fetcherQuery;
