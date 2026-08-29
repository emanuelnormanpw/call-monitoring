import { cn } from '@utils/cn';

import { SATISFIED_THRESHOLD } from './constants';
import type { PropsType } from './types';

const SentimentBadge = (props: PropsType) => {
  const { score } = props;

  const isPositive = score >= SATISFIED_THRESHOLD;

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'inline-flex items-center rounded-full px-[11px] py-[3px] text-[11.5px] leading-none font-bold',
          isPositive
            ? 'bg-success-soft text-success-ink'
            : 'bg-danger-soft text-danger-ink',
        )}
      >
        {score.toFixed(1)}%
      </span>
      <span className="text-ink-2 text-[12px] font-normal">
        {isPositive ? 'Satisfied' : 'Needs Review'}
      </span>
    </div>
  );
};

export default SentimentBadge;
