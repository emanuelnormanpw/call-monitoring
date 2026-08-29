export interface PropsType {
  page: number;
  totalPages: number;
  pageNumbers: number[];
  startEntry: number;
  endEntry: number;
  totalData: number;
  onPageChange: (page: number) => void;
}
