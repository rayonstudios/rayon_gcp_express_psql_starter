import { omit } from "lodash";
import { User } from "./user.types";

function sanitize(user: User) {
  return omit(user, ["password_hash", "refresh_token_version"]);
}

const userHelpers = {
  sanitize,
};

export default userHelpers;
