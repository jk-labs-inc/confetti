export type PaginationOptions = {
  currentPage?: number;
  itemsPerPage?: number;
};

export type SearchOptions = {
  searchString?: string;
  pagination?: PaginationOptions;
};
