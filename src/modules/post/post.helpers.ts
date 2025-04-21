import { isAdminRole } from "#/src/lib/utils/roles";
import { AuthUser } from "../auth/auth.types";
import { PostUnlinked } from "./post.types";

export const canMutatePost = (user: AuthUser, post: PostUnlinked) =>
  isAdminRole(user.role) || post.author_id === user.id;
