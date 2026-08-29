import type { SentimentFilter } from '@repositories/calls';

export interface SentimentFilterOption {
  label: string;
  value: SentimentFilter;
}

export interface PropsType {
  search: string;
  sentiment: SentimentFilter;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onSentimentChange: (value: SentimentFilter) => void;
}
