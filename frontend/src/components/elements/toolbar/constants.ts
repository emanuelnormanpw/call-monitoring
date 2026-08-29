import type { SentimentFilterOption } from './types';

export const SENTIMENT_FILTER_OPTIONS: SentimentFilterOption[] = [
  { label: 'Semua Sentimen', value: 'all' },
  { label: 'Score ≥ 70% (Satisfied)', value: '70_above' },
  { label: 'Score < 70% (Needs Review)', value: 'under_70' },
];

export const FIELD_CLASS = 'flex flex-col gap-1.5';

export const FIELD_LABEL_CLASS = 'text-ink-2 text-[12.5px] font-semibold';

export const INPUT_CLASS =
  'border-border bg-card text-ink placeholder:text-ink-3 focus:border-blue focus:ring-blue h-9 w-full rounded-[9px] border px-3 text-[13.5px] transition outline-none focus:ring-1';
