import type { QueryKey } from '@tanstack/react-query';

export const GET_CALLS_KEY: QueryKey = ['calls'];
export const GET_CALL_DETAIL_KEY = (id: string) => [`calls/${id}`];
