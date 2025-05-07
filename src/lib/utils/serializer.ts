import { PaginationSortResponse } from "./pagination";

export const getSerializers = <T, R, A extends unknown[]>(
  transformer: (data: T, ...args: A) => R
) => {
  const single = (data: T, ...args: A) => transformer(data, ...args);
  const multiple = (data: T[], ...args: A) =>
    data.map((item) => single(item, ...args));

  return {
    single,
    multiple,
    paginated: (data: PaginationSortResponse<T>, ...args: A) => ({
      ...data,
      list: multiple(data.list, ...args),
    }),
  };
};
