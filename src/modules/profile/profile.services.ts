import { prisma } from "#/src/lib/utils/prisma";

const update = async (
  id: string,
  data: {
    name?: string;
    bio?: string;
    photo?: string;
    added_fcm_token?: string;
    removed_fcm_token?: string;
  }
) => {
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
      name: data.name,
      bio: data.bio,
      photo: data.photo,
      fcm_tokens: updatedTokens.length > 0 ? { set: updatedTokens } : undefined,
    },
  });
};

export const profileService = {
  update,
};
