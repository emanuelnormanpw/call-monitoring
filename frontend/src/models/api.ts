export interface ApiResult<TData, TMeta = Record<string, unknown>> {
  data: TData;
  meta?: TMeta;
}

export interface ApiError<
  TMeta = Record<string, unknown>,
  TErrors = Record<string, string>,
> {
  message: string;
  statusCode: number;
  meta?: TMeta;
  errors?: TErrors;
}
