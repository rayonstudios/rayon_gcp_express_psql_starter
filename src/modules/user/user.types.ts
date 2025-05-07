import { PrismaEntityMutable } from "#/src/lib/types/misc";
import { Expand, Modify } from "#/src/lib/types/utils";
import { PaginationParams } from "#/src/lib/utils/pagination";
import { Role } from "#/src/lib/utils/roles";
import { Prisma } from "@prisma/client";
import { JsonValue, Optional } from "@prisma/client/runtime/library";

export type User = Expand<
  Modify<
    Prisma.usersCreateManyInput,
    { fcm_tokens?: string[]; photo_sizes?: JsonValue }
  >
>;

export type SanitizedUser = Omit<
  User,
  "password_hash" | "refresh_token_version"
>;

export type UserMutable = Omit<
  PrismaEntityMutable<User>,
  | "refresh_token_version"
  | "email_verified"
  | "password_hash"
  | "fcm_tokens"
  | "unread_noti_count"
  | "photo_sizes"
>;

// endpoint request types
export interface UserFetchList extends PaginationParams {
  search?: string;
  role?: Role;
}

export type UserCreate = Expand<Optional<UserMutable, "bio" | "photo">>;

export type UserUpdate = Partial<Omit<UserMutable, "email">>;
