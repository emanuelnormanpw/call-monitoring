export type HTTPMethods = 'PUT' | 'DELETE' | 'POST' | 'PATCH';

export interface HttpOptions {
  path: string;
  baseURL?: string;
  params?: string;
  method?: HTTPMethods | (string & NonNullable<unknown>);
  headers?: Record<string, string>;
  body?: Record<string, unknown> | BodyInit;
  /* TODO: will be removed in next enhancement */
  accessToken?: string;
  /**
   * If `true`, skip `snake_case` -> `camelCase` transform on JSON responses.
   *
   * @default false
   */
  disableCamelizeResponse?: boolean;
}
