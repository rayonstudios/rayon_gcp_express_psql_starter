import { GenericObject } from "../types/utils";

export const withSearch = (
  query: any,
  fields: string[],
  searchTerm: string
) => {
  const newQuery = { ...query };
  newQuery.where = {
    OR: fields.map((field) => {
      const fieldParts = field.split(".");
      let nestedQuery: GenericObject = {
        contains: searchTerm,
        mode: "insensitive",
      };

      for (let i = fieldParts.length - 1; i >= 0; i--) {
        nestedQuery = {
          [fieldParts[i]]: nestedQuery,
        };
      }

      return nestedQuery;
    }),
  };
  return newQuery;
};
