import { describe, expect, it } from 'vitest';

import { PAGE_ELLIPSIS, type PaginationItem } from '@elements/pagination';

import { buildPageNumbers } from '../build-page-numbers';

const onlyNumbers = (slots: PaginationItem[]) =>
  slots.filter((slot): slot is number => slot !== PAGE_ELLIPSIS);

describe('buildPageNumbers', () => {
  it('lists every page while they all still fit', () => {
    expect(buildPageNumbers(1, 1)).toEqual([1]);
    expect(buildPageNumbers(2, 3)).toEqual([1, 2, 3]);
    expect(buildPageNumbers(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('collapses only the right side near the start', () => {
    expect(buildPageNumbers(1, 20)).toEqual([1, 2, 3, 4, 5, PAGE_ELLIPSIS, 20]);
    expect(buildPageNumbers(3, 20)).toEqual([1, 2, 3, 4, 5, PAGE_ELLIPSIS, 20]);
  });

  it('collapses both sides around the middle', () => {
    expect(buildPageNumbers(10, 20)).toEqual([
      1,
      PAGE_ELLIPSIS,
      9,
      10,
      11,
      PAGE_ELLIPSIS,
      20,
    ]);
  });

  it('collapses only the left side near the end', () => {
    expect(buildPageNumbers(20, 20)).toEqual([
      1,
      PAGE_ELLIPSIS,
      16,
      17,
      18,
      19,
      20,
    ]);
  });

  it('keeps the first, last and current page reachable on every page', () => {
    for (const totalPages of [8, 20, 100]) {
      for (let page = 1; page <= totalPages; page++) {
        const numbers = onlyNumbers(buildPageNumbers(page, totalPages));

        expect(numbers, `total=${totalPages} page=${page}`).toContain(1);
        expect(numbers, `total=${totalPages} page=${page}`).toContain(
          totalPages,
        );
        expect(numbers, `total=${totalPages} page=${page}`).toContain(page);
      }
    }
  });

  it('emits strictly ascending numbers and never more than seven slots', () => {
    for (const totalPages of [8, 20, 100]) {
      for (let page = 1; page <= totalPages; page++) {
        const slots = buildPageNumbers(page, totalPages);
        const numbers = onlyNumbers(slots);
        // Array.from, not spread: the root tsconfig sets no `target`, so
        // iterating a Set directly would need downlevelIteration.
        const ascending = Array.from(new Set(numbers)).sort((a, b) => a - b);

        expect(numbers, `total=${totalPages} page=${page}`).toEqual(ascending);
        expect(
          slots.length,
          `total=${totalPages} page=${page}`,
        ).toBeLessThanOrEqual(7);
      }
    }
  });

  it('never places two ellipses next to each other', () => {
    for (const totalPages of [8, 20, 100]) {
      for (let page = 1; page <= totalPages; page++) {
        const slots = buildPageNumbers(page, totalPages);

        slots.forEach((slot, index) => {
          if (index === 0) return;
          expect(
            slot === PAGE_ELLIPSIS && slots[index - 1] === PAGE_ELLIPSIS,
            `total=${totalPages} page=${page}`,
          ).toBe(false);
        });
      }
    }
  });
});
