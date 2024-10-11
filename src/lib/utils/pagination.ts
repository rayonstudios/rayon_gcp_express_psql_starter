export type PaginationParams = {
  page?: number;
  limit?: number;
};

export const paginateQuery = (query: any, filters: any) => {
  if (filters?.limit && filters?.page) {
    query.take = filters.limit;
    query.skip = filters.limit * (filters.page - 1);
  }
  return query;
};
