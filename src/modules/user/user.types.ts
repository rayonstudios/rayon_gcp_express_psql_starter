import { PrismaEntityMutable } from "#/src/lib/types/misc";
import { Expand } from "#/src/lib/types/utils";
import { PaginationParams } from "#/src/lib/utils/pagination";
import { Prisma } from "@prisma/client";
import { Optional } from "@prisma/client/runtime/library";

export type User = Prisma.usersCreateManyInput;

export type SanitizedUser = Omit<
  User,
  "password_hash" | "refresh_token_version"
>;

export type UserMutable = Omit<
  PrismaEntityMutable<User>,
  "refresh_token_version" | "email_verified" | "password_hash"
>;

// endpoint request types
export interface UserFetchList extends PaginationParams {
  search?: string;
}

export type UserCreate = Expand<
  Optional<UserMutable, "bio" | "fcm_tokens" | "unread_noti_count">
>;

export type UserUpdate = Partial<Omit<UserMutable, "email">>;
