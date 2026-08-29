export interface SelectOption<TValue extends string = string> {
  label: string;
  value: TValue;
}

export interface PropsType<TValue extends string = string> {
  value: TValue;
  options: SelectOption<TValue>[];
  onChange: (value: TValue) => void;
  label?: string;
  /** Falls back to a generated id, so the label stays associated either way. */
  id?: string;
  disabled?: boolean;
}
