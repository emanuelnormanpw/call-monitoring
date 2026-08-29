import { MAX_VISIBLE_PAGES } from './constants';

export const buildPageNumbers = (page: number, totalPages: number) => {
  const pages: number[] = [];

  let start = Math.max(1, page - Math.floor(MAX_VISIBLE_PAGES / 2));
  const end = Math.min(totalPages, start + MAX_VISIBLE_PAGES - 1);

  if (end - start + 1 < MAX_VISIBLE_PAGES) {
    start = Math.max(1, end - MAX_VISIBLE_PAGES + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
};
