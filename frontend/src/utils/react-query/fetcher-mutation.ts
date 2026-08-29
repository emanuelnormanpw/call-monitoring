import { API_BASE_PATH } from '@constants/config';
import http from './http';
import type { FetcherMutationOptions } from './model';

/**
 * Fetcher helper for React Query mutations
 */
const fetcherMutation = async (options: FetcherMutationOptions) => {
  const { variables, context } = options;
  const {
    path = '',
    method,
    headers = {},
    basePath,
    apiVersion,
    isFormData,
    accessToken,
    disableCamelizeResponse,
  } = context;

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const version = apiVersion ? `/v${apiVersion}` : '';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  const requestOptions = {
    path: `${basePath ?? API_BASE_PATH}${version}${normalizedPath}`,
    body: variables,
    method: method ?? 'POST',
    headers,
    accessToken,
    disableCamelizeResponse,
  };

  const response = await http(requestOptions);
  return Promise.resolve(response);
};

export default fetcherMutation;
