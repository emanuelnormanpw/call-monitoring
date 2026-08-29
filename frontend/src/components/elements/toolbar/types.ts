import type { SelectOption } from '@elements/select';
import type { SentimentFilter } from '@repositories/calls';

export type SentimentFilterOption = SelectOption<SentimentFilter>;

export interface PropsType {
  search: string;
  sentiment: SentimentFilter;
  /** `YYYY-MM-DD`, empty string means the bound is not set. */
  startDate: string;
  endDate: string;
  /** Earliest and latest date the period inputs allow. */
  minDate: string;
  maxDate: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onSentimentChange: (value: SentimentFilter) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}
