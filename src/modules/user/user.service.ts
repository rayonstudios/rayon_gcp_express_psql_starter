import { paginateQuery } from "#/src/lib/utils/pagination";
import { prisma } from "#/src/lib/utils/prisma";
import { omit } from "lodash";
import { UserCreate, UserFetchList, UserUpdate } from "./user.types";

async function fetch(id: string) {
  const user = await prisma.users.findUnique({
    where: {
      xata_id: id,
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
  const users = await prisma.users.findMany(paginateQuery(query, filters));
  return users;
}

async function create(data: UserCreate) {
  const user = await prisma.users.create({
    data: {
      ...data,
      bio: data.bio || "",
    },
  });
  return user;
}

async function update(id: string, data: UserUpdate) {
  const user = await prisma.users.update({
    where: {
      xata_id: id,
    },
    data: omit(data, "id"),
  });
  return user;
}

async function remove(id: string) {
  const user = await prisma.users.delete({
    where: {
      xata_id: id,
    },
  });
  return user;
}

const userService = {
  fetch,
  fetchList,
  create,
  update,
  remove,
};

export default userService;
