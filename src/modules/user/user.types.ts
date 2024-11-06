import { PrismaEntityMutable } from "#/src/lib/types/misc";
import { Expand } from "#/src/lib/types/utils";
import { PaginationParams } from "#/src/lib/utils/pagination";
import { Prisma } from "@prisma/client";
import { Optional } from "@prisma/client/runtime/library";

export type User = Omit<Prisma.usersCreateInput, "posts">;

export type SanitizedUser = Omit<
  User,
  "password_hash" | "refresh_token_version"
>;

type UserMutable = Omit<
  PrismaEntityMutable<User>,
  "refresh_token_version" | "email_verified" | "password_hash"
>;

export interface UserFetchList extends PaginationParams {
  search?: string;
}

export type UserCreate = Expand<Optional<UserMutable, "bio">>;

export type UserUpdate = Partial<Omit<UserMutable, "email">>;
