import { sanitizeUser } from "../user/user.helpers";
import { User } from "../user/user.types";
import { AuthLoginResponse } from "./auth.types";

const login = (tokens: Omit<AuthLoginResponse, "user">, user: User) => ({
  ...tokens,
  user: sanitizeUser(user),
});

const authSerializer = {
  login,
};

export default authSerializer;
