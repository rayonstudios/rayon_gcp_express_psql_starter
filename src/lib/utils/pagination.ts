import { Prisma } from "@prisma/client";
import { cloneDeep, omit } from "lodash";
import { prisma } from "./prisma";

export type SortFields<T, K extends keyof T> = K;

export enum SortOrder {
  Asc = "asc",
  Desc = "desc",
}

export type PaginationSortParams<T> = {
  page?: number;
  limit?: number;
  sortField?: T;
  sortOrder?: SortOrder;
};

export type PaginationSortResponse<T> = {
  list: T[];
  total?: number;
};

// Todo: support sorting relations' fields
export const paginatedSortQuery = async <T>(
  model: Prisma.ModelName,
  query: any,
  paginationParams?: PaginationSortParams<keyof T>
): Promise<PaginationSortResponse<T>> => {
  const findQuery = cloneDeep(query);
  if (paginationParams?.limit) {
    findQuery.take = paginationParams.limit;
    findQuery.skip =
      paginationParams.limit * ((paginationParams.page || 1) - 1);
  }

  if (paginationParams?.sortField && paginationParams?.sortOrder) {
    findQuery.orderBy = {
      [paginationParams.sortField]: paginationParams.sortOrder,
    };
  }

  const [list, total] = await prisma.$transaction([
    (prisma[model] as any).findMany(findQuery),
    // If pagination is enabled then fetch total count as well
    ...(paginationParams?.limit
      ? [(prisma[model] as any).count(omit(query, ["include", "select"]))]
      : []),
  ]);

  return {
    list,
    total,
  };
};
