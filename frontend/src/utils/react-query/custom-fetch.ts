import { client } from '@constants/client';
import {
  CustomError,
  type FetchInitType,
  type FetchRequestInfoType,
} from './model/custom-fetch';
import isCustomError from './is-custom-error';

const customFetch = async (
  url: FetchRequestInfoType,
  options: FetchInitType = {},
): Promise<Response> => {
  try {
    const request = await client(url, options);
    return request;
  } catch (error) {
    if (isCustomError(error)) {
      if (error.name === 'AbortError') {
        const customError = new CustomError(
          'Request Aborted - Timeout Exceeded',
          undefined,
        );
        customError.name = error.name;

        throw customError;
      }
    }

    throw error;
  }
};

export default customFetch;
