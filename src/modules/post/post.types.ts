import { PrismaEntityMutable } from "#/src/lib/types/misc";
import { Expand, Modify } from "#/src/lib/types/utils";
import { PaginationParams } from "#/src/lib/utils/pagination";
import { Prisma } from "@prisma/client";
import { SanitizedUser, User } from "../user/user.types";

export type PostUnlinked = Expand<
  Modify<Prisma.postsCreateManyInput, { labels: string[] }>
>;
type PostMutable = Omit<PrismaEntityMutable<PostUnlinked>, "views" | "slug">;

export type PostRaw = PostUnlinked & { author: User };

export type Post = Expand<PostUnlinked & { author: SanitizedUser }>;

// endpoint request types
export type PostCreate = Expand<Omit<PostMutable, "author_id">>;

export type PostUpdate = Expand<Partial<PostMutable>>;

export interface PostFetchList extends PaginationParams {
  search?: string;
  author_id?: string;
  labels?: string[];
  populate?: boolean;
}
