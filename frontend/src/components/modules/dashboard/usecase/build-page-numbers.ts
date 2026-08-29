import { PAGE_ELLIPSIS, type PaginationItem } from '@elements/pagination';

import { PAGINATION_SIBLING_COUNT } from './constants';

const range = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, index) => start + index);

/**
 * Build the pager slots. The first and last page are always anchored and the
 * gaps around the current page collapse into an ellipsis, so a long result set
 * reads as `1 … 9 10 11 … 20` instead of a sliding window that hides both ends.
 */
export const buildPageNumbers = (
  page: number,
  totalPages: number,
): PaginationItem[] => {
  // first + last + current + siblings on both sides + the two ellipsis slots
  const maxSlots = PAGINATION_SIBLING_COUNT * 2 + 5;

  if (totalPages <= maxSlots) return range(1, totalPages);

  const leftSibling = Math.max(page - PAGINATION_SIBLING_COUNT, 1);
  const rightSibling = Math.min(page + PAGINATION_SIBLING_COUNT, totalPages);

  const hasLeftGap = leftSibling > 2;
  const hasRightGap = rightSibling < totalPages - 1;

  // How many pages to show in a row when only one side is collapsed.
  const edgeCount = PAGINATION_SIBLING_COUNT * 2 + 3;

  if (!hasLeftGap && hasRightGap) {
    return [...range(1, edgeCount), PAGE_ELLIPSIS, totalPages];
  }

  if (hasLeftGap && !hasRightGap) {
    return [1, PAGE_ELLIPSIS, ...range(totalPages - edgeCount + 1, totalPages)];
  }

  return [
    1,
    PAGE_ELLIPSIS,
    ...range(leftSibling, rightSibling),
    PAGE_ELLIPSIS,
    totalPages,
  ];
};
