import { useId } from 'react';

import { cn } from '@utils/cn';

import type { PropsType } from './types';

const Select = <TValue extends string>(props: PropsType<TValue>) => {
  const { value, options, onChange, label, id, disabled } = props;

  const generatedId = useId();

  const selectId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="text-ink-2 text-[12.5px] font-semibold"
        >
          {label}
        </label>
      )}

      <select
        id={selectId}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as TValue)}
        className={cn(
          'border-border bg-card text-ink focus:border-blue focus:ring-blue h-9 w-full cursor-pointer rounded-[9px] border px-2.5 text-[13.5px] transition outline-none focus:ring-1',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
