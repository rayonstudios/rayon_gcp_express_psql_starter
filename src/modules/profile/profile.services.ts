import { prisma } from "#/src/lib/utils/prisma";
import { omit } from "lodash";
import { ProfileUpdate } from "./profile.types";

const update = async (id: string, data: ProfileUpdate) => {
  const user = await prisma.users.findUnique({
    where: { id },
    select: { fcm_tokens: true },
  });

  let updatedTokens = user?.fcm_tokens || [];

  if (data.added_fcm_token) {
    if (!updatedTokens.includes(data.added_fcm_token)) {
      updatedTokens.push(data.added_fcm_token);
    }
  } else if (data.removed_fcm_token) {
    updatedTokens = updatedTokens.filter(
      (token) => token !== data.removed_fcm_token
    );
  }
  return prisma.users.update({
    where: { id },
    data: {
      ...omit(data, ["added_fcm_token", "removed_fcm_token"]),
      fcm_tokens: updatedTokens,
    },
  });
};

export const profileService = {
  update,
};
