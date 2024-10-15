export type GenericObject = Record<string, any>;
export type KeyValuePair = Record<string, string>;

export interface APIResponse<T = null> {
  data: T | null;
  error: string | null;
}

export type Expand<T> = { [K in keyof T]: T[K] };

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type RenameBy<U, T> = {
  [K in keyof U as K extends keyof T
    ? T[K] extends string
      ? T[K]
      : never
    : K]: K extends keyof U ? U[K] : never;
};

export type PrismaEntityMutable<T> = Omit<
  T,
  "id" | "created_at" | "updated_at"
>;
