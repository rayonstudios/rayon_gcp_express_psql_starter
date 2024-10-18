import { omit } from "lodash";
import { User } from "./user.types";

export function sanitizeUser(user: User) {
  return omit(user, ["password_hash", "refresh_token_version"]);
}
