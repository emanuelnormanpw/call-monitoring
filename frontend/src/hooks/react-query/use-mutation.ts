import { useMutation as _useMutation } from '@tanstack/react-query';

import COOKIES_KEY from '@constants/cookies';
import type { ApiError } from '@models/api';
import {
  type CustomError,
  type FetcherMutationOptions,
  fetcherMutation,
} from '@utils/react-query';
import useCookie from '../use-cookie/use-cookie';
import type { MutationFnArgs, UseMutationOptions } from './types';

const useMutation = <
  TData = unknown,
  TError = ApiError,
  TVariables = unknown,
  TContext = unknown,
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>,
) => {
  const { mutationFn, ...resOptions } = options;
  const { cookies } = useCookie();

  return _useMutation<
    TData,
    CustomError<TError>,
    MutationFnArgs<TVariables>,
    TContext
  >({
    mutationFn: async (args: MutationFnArgs<TVariables>, context) => {
      const { context: _context = {}, variables } = args;
      const finalContext = {
        path: '',
        accessToken: cookies[COOKIES_KEY.AUTHORIZATION],
        ..._context,
      } as FetcherMutationOptions['context'];

      const result: unknown = await (mutationFn
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (mutationFn as any)(args, context)
        : fetcherMutation({ context: finalContext, variables }));
      return result as TData;
    },
    ...resOptions,
  });
};

export default useMutation;
