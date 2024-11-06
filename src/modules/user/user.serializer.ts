import { PaginationResponse } from "#/src/lib/utils/pagination";
import { sanitizeUser } from "./user.helpers";
import { User } from "./user.types";

const single = (user: User) => sanitizeUser(user);

const multiple = (users: User[]) => users.map(sanitizeUser);

const paginated = (data: PaginationResponse<User>) => ({
  ...data,
  list: multiple(data.list),
});

const userSerializer = {
  single,
  multiple,
  paginated,
};

export default userSerializer;
