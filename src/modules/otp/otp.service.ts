import mailService from "#/src/lib/mail/mail.service";
import {
  AuthTemplateParams,
  AuthTemplateType,
} from "#/src/lib/mail/mail.types";
import { randomString } from "#/src/lib/utils";
import { prisma } from "#/src/lib/utils/prisma";
import dayjs from "dayjs";
import { User } from "../user/user.types";
const send = async (
  user: User,
  templateMethod: AuthTemplateType = "verifyEmail"
) => {
  const otp = randomString(6);
  await prisma.otps.create({
    data: { email: user.email, otp },
  });

  const template = mailService.templates.authentication[templateMethod];
  let templateParams: AuthTemplateParams;

  if (templateMethod === "createUser") {
    templateParams = {
      name: user.name,
      role: user.role || "",
    };
  } else {
    templateParams = {
      otp,
      email: user.email,
      name: user.name,
    };
  }
  await mailService.send({
    to: user.email,
    //@ts-ignore
    template: template(templateParams),
  });
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
  send,
  verify,
};

export default otpService;
