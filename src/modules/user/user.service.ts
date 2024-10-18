import { paginatedQuery } from "#/src/lib/utils/pagination";
import { prisma } from "#/src/lib/utils/prisma";
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
  const query: Parameters<typeof prisma.users.findMany>[0] = {};
  if (filters?.name) {
    query.where = {
      name: filters.name,
    };
  }

  return paginatedQuery<User>("users", query, filters);
}

async function create(data: UserCreate & { password: string }) {
  const password_hash = await authService.hashPassword(data.password);
  const user = await prisma.users
    .create({
      data: {
        ...omit(data, "password"),
        password_hash,
        bio: data.bio || "",
      },
    })
    .catch((e) => {
      console.log(e);
      return null;
    });
  return user;
}

async function update(id: string, data: UserUpdate) {
  const user = await prisma.users
    .update({
      where: {
        id,
      },
      data: omit(data, "id"),
    })
    .catch(() => null);
  return user;
}

async function remove(id: string) {
  const user = await prisma.users
    .delete({
      where: {
        id,
      },
    })
    .catch(() => null);
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
