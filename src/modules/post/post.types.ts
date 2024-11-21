import { PrismaEntityMutable } from "#/src/lib/types/misc";
import { Expand } from "#/src/lib/types/utils";
import { PaginationParams } from "#/src/lib/utils/pagination";
import { Prisma } from "@prisma/client";
import { SanitizedUser, User } from "../user/user.types";

export type PostUnlinked = Prisma.postsCreateManyInput;

export type PostRaw = PostUnlinked & { author: User };

export type Post = Expand<PostUnlinked & { author: SanitizedUser }>;

type PostMutable = Omit<PrismaEntityMutable<PostUnlinked>, "views" | "slug">;

export type PostCreate = Expand<Omit<PostMutable, "author_id">>;

export type PostUpdate = Expand<Partial<PostMutable>>;

export interface PostFetchList extends PaginationParams {
  search?: string;
  author_id?: string;
  labels?: string[];
  populate?: boolean;
}
