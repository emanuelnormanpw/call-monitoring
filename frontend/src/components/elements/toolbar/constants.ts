import type { SentimentFilterOption } from './types';

export const SENTIMENT_FILTER_OPTIONS: SentimentFilterOption[] = [
  { label: 'Semua Sentimen', value: 'all' },
  { label: 'Score ≥ 70% (Satisfied)', value: '70_above' },
  { label: 'Score < 70% (Needs Review)', value: 'under_70' },
];
