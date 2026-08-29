export interface TableMeta {
  message?: string;
  totalData?: number;
}

export interface TablePagination {
  page: number;
  limit: number;
  totalData?: number;
}

export interface TableQuery {
  limit?: number;
  page?: number;
  search?: string;
}
