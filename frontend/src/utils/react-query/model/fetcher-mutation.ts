import type { QueryMeta } from '@hooks/react-query';
import type { HTTPMethods } from './http';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface FetcherMutationOptions<TVars = any> {
  variables?: TVars;
  context: MutationFnContext;
}

export interface MutationFnContext extends QueryMeta {
  path: string;
  method?: HTTPMethods;
  headers?: Record<string, string>;
  isFormData?: boolean;
  contentType?: string;
  basePath?: string;
  apiVersion?: '1';
  accessToken?: string;
}
