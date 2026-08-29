import { PAGE_ELLIPSIS } from './constants';

/** One slot in the pager: either a page number or a collapsed gap. */
export type PaginationItem = number | typeof PAGE_ELLIPSIS;

export interface PaginationProps {
  page: number;
  totalPages: number;
  pageNumbers: PaginationItem[];
  startEntry: number;
  endEntry: number;
  totalData: number;
  onPageChange: (page: number) => void;
}
