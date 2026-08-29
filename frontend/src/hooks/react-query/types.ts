import type {
  QueryKey,
  UseMutationOptions as DefaultUseMutationOptions,
  UseQueryOptions as DefaultUseQueryOptions,
  UseInfiniteQueryOptions as DefaultUseInfiniteQueryOptions,
  QueryFunctionContext as DefaultQueryFunctionContext,
  QueryMeta as DefaultQueryMeta,
  InfiniteData,
} from '@tanstack/react-query';

import type { CustomError, MutationFnContext } from '@utils/react-query';

export type MutationFnArgs<TVars = unknown> = (TVars extends object
  ? {
      variables: TVars;
    }
  : { variables?: TVars }) & {
  context?: Omit<MutationFnContext, 'path'> &
    Pick<Partial<MutationFnContext>, 'path'>;
};

export type UseMutationOptions<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
> = DefaultUseMutationOptions<
  TData,
  CustomError<TError>,
  MutationFnArgs<TVariables>,
  TContext
>;

export interface UseQueryOptions<
  TQueryFnData = unknown,
  TError = Record<string, unknown>,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> extends Omit<
  DefaultUseQueryOptions<TQueryFnData, CustomError<TError>, TData, TQueryKey>,
  'queryKey' | 'meta'
> {
  meta?: QueryMeta;
  queryKey?: TQueryKey;
}

export interface UseInfiniteQueryOptions<
  TQueryFnData = unknown,
  TError = Record<string, unknown>,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
> extends Omit<
  DefaultUseInfiniteQueryOptions<
    TQueryFnData,
    CustomError<TError>,
    TData,
    TQueryKey,
    TPageParam
  >,
  'queryKey' | 'meta'
> {
  meta?: QueryMeta;
  queryKey?: TQueryKey;
}

export interface QueryMeta extends DefaultQueryMeta {
  accessToken?: string;
  basePath?: string;
  apiVersion?: '1';
  disableCamelizeResponse?: boolean;
}

export type QueryFunctionContext<
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = never,
> = Omit<DefaultQueryFunctionContext<TQueryKey, TPageParam>, 'meta'> & {
  meta?: QueryMeta;
};
