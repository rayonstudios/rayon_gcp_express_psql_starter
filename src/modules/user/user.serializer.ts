import { getSerializers } from "#/src/lib/utils/serializer";
import { sanitizeUser } from "./user.helpers";
import { User } from "./user.types";

const { single, multiple, paginated } = getSerializers((user: User) =>
  sanitizeUser(user)
);

const userSerializer = {
  single,
  multiple,
  paginated,
};

export default userSerializer;
