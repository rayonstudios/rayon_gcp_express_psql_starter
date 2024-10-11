import {
  Expand,
  PrismaEntity,
  PrismaEntityMutable,
} from "#/src/lib/types/misc";
import { PaginationParams } from "#/src/lib/utils/pagination";
import { Prisma } from "@prisma/client";
import { Optional } from "@prisma/client/runtime/library";

export type User = PrismaEntity<Omit<Prisma.usersCreateInput, "posts">>;

type UserMutable = PrismaEntityMutable<User>;

export interface UserFetchList extends PaginationParams {
  name?: string;
}

export type UserCreate = Expand<Optional<UserMutable, "bio">>;

export type UserUpdate = Partial<Omit<UserMutable, "email">>;
