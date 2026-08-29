import humps from 'humps';
import { API_HOST, API_TIMEOUT } from '@constants/config';
import { throwIfMaintenance } from '@core/maintenance';
import { queryStringify } from '@utils/url';

import { type HttpOptions, CustomError } from './model';
import customFetch from './custom-fetch';

/**
 * Timeout promise wrapper with AbortController
 */
const timeout = <T>(
  promise: Promise<T>,
  options: {
    controller: AbortController;
  },
  ms: number,
) => {
  const { controller } = options;

  const timer = new Promise<never>((_, reject) => {
    setTimeout(() => {
      const customError = new CustomError(
        'Request Aborted - Timeout Exceeded',
        undefined,
      );
      customError.name = 'AbortError';

      controller.abort();
      reject(customError);
    }, ms);
  });

  return Promise.race<T>([timer, promise]);
};

/**
 * Main HTTP request utility
 */
const http = async (options: HttpOptions) => {
  throwIfMaintenance();

  const {
    path,
    baseURL,
    params,
    method = 'GET',
    headers = {},
    body,
    accessToken,
    disableCamelizeResponse = false,
  } = options;
  let _http_body: unknown | undefined = undefined;
  let _params = undefined;

  const contentType = headers['Content-Type'] ?? headers['content-type'];
  const isJsonRequest =
    !contentType || contentType.includes('application/json');

  switch (method) {
    case 'DELETE':
    case 'POST':
    case 'PUT':
    case 'PATCH':
      if (!isJsonRequest) {
        _http_body = body;
        break;
      }
      _http_body = body ? JSON.stringify(humps.decamelizeKeys(body)) : '';
      break;
    case 'GET':
      _params = body
        ? queryStringify(
            humps.decamelizeKeys(body as Record<string, unknown>) as Record<
              string,
              unknown
            >,
          )
        : params;
      break;
    default:
      break;
  }

  const base = baseURL || API_HOST;
  const endpoint = base + path;
  const requestPath = endpoint + (_params ? `?${_params}` : '');

  const controller = new AbortController();

  const request = customFetch(requestPath, {
    method: method,
    body: _http_body as BodyInit,
    signal: controller.signal,
    credentials: 'include',
    headers: {
      ...(accessToken && { Authorization: accessToken }),
      ...headers,
    },
  });

  const response = await timeout<Response>(
    request,
    { controller },
    API_TIMEOUT,
  );

  if (!response.headers.get('content-type')?.includes('application/json')) {
    return response.blob();
  }

  const result = {
    statusCode: response.status,
  };

  if (response.status === 204) return result;

  const rawJson = await response.json();
  const json = disableCamelizeResponse ? rawJson : humps.camelizeKeys(rawJson);

  return { ...(json as object), ...result };
};

export default http;
