import { isAdminRole } from "#/src/lib/utils/roles";
import { Optional } from "@prisma/client/runtime/library";
import { AuthUser } from "../auth/auth.types";
import { PostUnlinked } from "./post.types";

export const canMutatePost = (
  user: Optional<AuthUser, "role">,
  post: PostUnlinked
) => isAdminRole(user.role || "") || post.author_id === user.id;
