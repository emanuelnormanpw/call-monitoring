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

export interface CallsQueryParam {
  search?: string;
  sentiment?: SentimentFilter | string;
  page?: number;
  limit?: number;
}
