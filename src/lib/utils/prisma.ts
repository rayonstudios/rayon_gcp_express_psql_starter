import { PrismaClient } from "@prisma/client";
import { Modify } from "../types/utils";

export const prisma = new PrismaClient();

export const fieldTransform = <T, K extends keyof T, R>(
  data: T,
  key: K,
  transformer: (value: T[K], record: T) => R
): Modify<T, { [P in K]: R }> => {
  return {
    ...data,
    [key]: transformer(data[key], data),
  };
};

export const fieldTransformArray = <T, K extends keyof T, R>(
  data: T[],
  key: K,
  transformer: (value: T[K], record: T) => R
): Modify<T, { [P in K]: R }>[] => {
  return data.map((record) => fieldTransform(record, key, transformer));
};
