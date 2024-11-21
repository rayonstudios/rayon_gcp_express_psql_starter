import { fieldTransform } from "#/src/lib/utils/prisma";
import { getSerializers } from "#/src/lib/utils/serializer";
import { sanitizeUser } from "../user/user.helpers";
import { User } from "../user/user.types";
import { PostRaw } from "./post.types";

const { single, multiple, paginated } = getSerializers((post: PostRaw) =>
  post.author
    ? fieldTransform(post, "author", (user) => sanitizeUser(user as User))
    : post
);

const postSerializer = {
  single,
  multiple,
  paginated,
};

export default postSerializer;
