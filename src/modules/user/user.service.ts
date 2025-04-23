import { paginatedQuery } from "#/src/lib/utils/pagination";
import { prisma } from "#/src/lib/utils/prisma";
import { withSearch } from "#/src/lib/utils/search";
import { omit } from "lodash";
import authService from "../auth/auth.service";
import { User, UserCreate, UserFetchList, UserUpdate } from "./user.types";

async function fetch(id: string) {
  const user = await prisma.users.findUnique({
    where: {
      id,
    },
  });
  return user;
}

async function fetchByEmail(email: string) {
  const user = await prisma.users.findUnique({
    where: {
      email,
    },
  });
  return user;
}

async function fetchList(filters?: UserFetchList) {
  let query: Parameters<typeof prisma.users.findMany>[0] = {};

  if (filters?.search)
    query = withSearch(query, ["name", "bio", "email"], filters.search);

  if (filters?.role) query!.where = { role: filters.role };

  const res = await paginatedQuery<User>("users", query, filters);
  return res;
}

async function create(data: UserCreate & { password: string }) {
  const password_hash = await authService.hashPassword(data.password);
  const user = await prisma.users.create({
    data: {
      ...omit(data, "password"),
      password_hash,
      fcm_tokens: [],
      unread_noti_count: 0,
    },
  });
  return user;
}

async function update(id: string, data: UserUpdate) {
  const user = await prisma.users.update({
    where: {
      id,
    },
    data: omit(data, "id"),
  });
  return user;
}

async function remove(id: string) {
  const user = await prisma.users.delete({
    where: {
      id,
    },
  });
  return user;
}

const userService = {
  fetch,
  fetchByEmail,
  fetchList,
  create,
  update,
  remove,
};

export default userService;
