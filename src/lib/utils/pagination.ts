import { Prisma } from "@prisma/client";
import { cloneDeep } from "lodash";
import { prisma } from "./prisma";

export type PaginationParams = {
  page?: number;
  limit?: number;
};

export type PaginationResponse<T> = {
  list: T[];
  total: number;
};

export const paginatedQuery = async <T>(
  model: Prisma.ModelName,
  query: any,
  filters: any
): Promise<PaginationResponse<T>> => {
  const findQuery = cloneDeep(query);
  if (filters?.limit && filters?.page) {
    findQuery.take = filters.limit;
    findQuery.skip = filters.limit * (filters.page - 1);
  }

  const [list, total] = await prisma.$transaction([
    (prisma[model] as any).findMany(findQuery),
    (prisma[model] as any).count(query),
  ]);

  return {
    list,
    total,
  };
};
