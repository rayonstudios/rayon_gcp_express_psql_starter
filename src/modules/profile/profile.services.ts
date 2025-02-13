import { prisma } from "#/src/lib/utils/prisma";

async function removeFCMToken(userId: string, fcm_token: string) {
  return prisma.users.update({
    where: {
      id: userId,
    },
    data: {
      fcm_tokens: {
        set:
          (
            await prisma.users.findUnique({
              where: { id: userId },
              select: { fcm_tokens: true },
            })
          )?.fcm_tokens.filter((token) => token !== fcm_token) || [],
      },
    },
  });
}

const addFcmToken = async (id: string, token: string) => {
  const user = await prisma.users.findUnique({
    where: { id },
    select: { fcm_tokens: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const updatedTokens = user.fcm_tokens.includes(token)
    ? user.fcm_tokens
    : [...user.fcm_tokens, token];

  const updatedUser = await prisma.users.update({
    where: { id },
    data: { fcm_tokens: updatedTokens },
  });

  return updatedUser;
};

export const profileService = {
  removeFCMToken,
  addFcmToken,
};
