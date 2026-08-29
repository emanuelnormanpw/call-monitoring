import ky from 'ky';
import { QueryClient, type QueryFunction } from '@tanstack/react-query';

import { throwIfMaintenance } from '@core/maintenance';
import type { ApiError } from '@models/api';
import { getCookie } from '@utils/cookie';
import fetcherQuery from '@utils/react-query/fetcher-query';
import {
  blacklistStatusCode,
  CustomError,
} from '@utils/react-query/model/custom-fetch';

import COOKIES_KEY from './cookies';

const MAX_RETRY = 3;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: fetcherQuery as QueryFunction,
      retry: (failureCount, err) => {
        const error = err as CustomError;
        return failureCount < MAX_RETRY && Boolean(error?.retry);
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: (failureCount, err) => {
        const error = err as CustomError;
        return failureCount < MAX_RETRY && Boolean(error?.retry);
      },
    },
  },
});

export const client = ky.create({
  retry: {
    limit: MAX_RETRY,
    methods: ['get', 'put', 'delete', 'patch'],
    statusCodes: [401],
  },
  hooks: {
    beforeRequest: [
      () => {
        throwIfMaintenance();
      },
      (req) => {
        const cookies = getCookie() || {};
        const authorization = cookies[COOKIES_KEY.AUTHORIZATION];

        if (authorization) req.headers.set('Authorization', authorization);
      },
    ],
    afterResponse: [
      async (_r, _o, res) => {
        if (!res.ok) {
          let errorResponse: Record<string, unknown> = {};

          if (res.headers.get('content-type')?.includes('application/json')) {
            errorResponse = await res.json();
          }

          const customError = new CustomError(
            `[${res.status}] ${res.statusText}`,
            {
              ...errorResponse,
              ...(!errorResponse.status_code && {
                statusCode: res.status,
              }),
            } as ApiError,
            {
              retry: !blacklistStatusCode.some(
                (statusCode) => statusCode === res.status,
              ),
            },
          );
          customError.name = 'ApiError';

          throw customError;
        }
      },
    ],
  },
});
