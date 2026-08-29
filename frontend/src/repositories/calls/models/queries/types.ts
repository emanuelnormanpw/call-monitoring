export interface CallItem {
  callId: string;
  callTimestamp: string;
  csName: string;
  customerName: string;
  sentimentScore: number;
}

export interface CallsResponse {
  data: CallItem[];
  totalData: number;
  page: number;
  limit: number;
  statusCode?: number;
}

export type SentimentFilter = 'all' | 'under_70' | '70_above';

export type SortDirection = 'asc' | 'desc';

export interface CallsQueryParam {
  search?: string;
  sentiment?: SentimentFilter | string;
  /** Inclusive lower bound of the period filter, formatted `YYYY-MM-DD`. */
  startDate?: string;
  /** Inclusive upper bound of the period filter, formatted `YYYY-MM-DD`. */
  endDate?: string;
  sortBy?: string;
  sortDir?: SortDirection;
  page?: number;
  limit?: number;
}
