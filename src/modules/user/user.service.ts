import { FIREBASE_AUTH_ENABLED } from "#/src/lib/constants";
import { firebase } from "#/src/lib/firebase/firebase.service";
import { paginatedSortQuery } from "#/src/lib/utils/pagination";
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

  if (filters?.role) query!.where = { ...query?.where, role: filters.role };

  if (filters?.initial_created_at) {
    query.where = {
      ...query.where,
      created_at: {
        gte: filters.initial_created_at,
      },
    };
  }

  if (filters?.final_created_at) {
    query.where = {
      ...query.where,
      created_at: {
        ...((query.where?.created_at ?? {}) as object),
        lte: filters.final_created_at,
      },
    };
  }

  if (filters?.search)
    query = withSearch(query, ["name", "bio", "email"], filters.search);

  const res = await paginatedSortQuery<User>("users", query, filters);
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

  // Create user in Firebase Auth and set custom claims
  if (FIREBASE_AUTH_ENABLED) {
    await firebase
      .auth()
      .createUser({ uid: user.id, email: user.email, password: data.password })
      .catch(console.error);
    await firebase
      .auth()
      .setCustomUserClaims(user.id, { role: user.role })
      .catch(console.error);
  }

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
  // Remove user from Firebase Auth
  if (FIREBASE_AUTH_ENABLED) {
    await firebase.auth().deleteUser(id).catch(console.error);
  }

  return user;
}

async function updatePassword(id: string, newPassword: string) {
  const newHashedPassword = await authService.hashPassword(newPassword);
  await prisma.users.update({
    where: { id },
    data: {
      password_hash: newHashedPassword,
    },
  });

  // Update password in Firebase Auth
  if (FIREBASE_AUTH_ENABLED) {
    await firebase.auth().updateUser(id, { password: newPassword });
  }
}

const userService = {
  fetch,
  fetchByEmail,
  fetchList,
  create,
  update,
  remove,
  updatePassword,
};

export default userService;
