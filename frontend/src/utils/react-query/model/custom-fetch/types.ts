import humps from 'humps';
import type { ApiError } from '@models/api';
import isCustomError from '../../is-custom-error';

type FetchArgumentType = Parameters<typeof fetch>;
export interface CustomErrorOptions {
  /**
   * @default false
   */
  retry?: boolean;
}
export type FetchRequestInfoType = NonNullable<FetchArgumentType['0']>;
export type FetchInitType = NonNullable<FetchArgumentType['1']> &
  Omit<CustomErrorOptions, 'retry'>;

export class CustomError<TPayload = ApiError> extends Error {
  public retry: boolean;

  public payload: TPayload;

  constructor(
    message: string | CustomError<TPayload>,
    payload?: TPayload,
    options: CustomErrorOptions = {},
  ) {
    const { retry = false } = options;

    if (isCustomError<TPayload>(message)) {
      const error = message;

      super(error.message);
      Object.assign(this, error);
      this.payload = payload ?? error.payload;
      this.retry = options.retry ?? error.retry;
      return;
    }

    super(message);
    this.retry = retry;
    this.payload = payload
      ? (humps.camelizeKeys(payload) as TPayload)
      : ({} as TPayload);
  }
}
