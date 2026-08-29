import queryString from 'query-string';

const { stringify } = queryString;

export const STRINGIFY_OPTIONS = {
  skipEmptyString: true,
  skipNull: true,
};

const queryStringify = (object: Record<string, unknown>): string => {
  const convert = stringify(object, STRINGIFY_OPTIONS);
  return convert;
};

export default queryStringify;
