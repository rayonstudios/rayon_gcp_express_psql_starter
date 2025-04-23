import { randomString } from "#/src/lib/utils";
import { prisma } from "#/src/lib/utils/prisma";
import dayjs from "dayjs";

const create = async (email: string) => {
  const otp = randomString(6);
  await prisma.otps.create({
    data: { email, otp },
  });
  return otp;
};

const verify = async ({ email, otp }: { email: string; otp: string }) => {
  const records = await prisma.otps.findMany({
    where: {
      email,
      otp,
      created_at: {
        gte: dayjs().subtract(Number(process.env.OTP_LIFE), "minutes").toDate(),
      },
    },
  });

  if (!records.length) return false;

  const deleted = await prisma.otps.deleteMany({
    where: {
      email,
      otp,
    },
  });
  return deleted.count > 0;
};

const otpService = {
  create,
  verify,
};

export default otpService;
