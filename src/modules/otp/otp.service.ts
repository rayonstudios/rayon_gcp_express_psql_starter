import mailService from "#/src/lib/mail/mail.service";
import { randomString } from "#/src/lib/utils";
import { prisma } from "#/src/lib/utils/prisma";
import dayjs from "dayjs";
import { TemplateMethod, TemplateParams } from "../otp/otp.types";
import { User } from "../user/user.types";

const send = async (
  user: User,
  templateMethod: TemplateMethod = "verifyEmail"
) => {
  const otp = randomString(6);
  await prisma.otps.create({
    data: { email: user.email, otp },
  });

  const template = mailService.templates.authentication[templateMethod];
  let templateParams: TemplateParams;

  if (templateMethod === "createUser") {
    templateParams = {
      name: user.name,
      inviter: "jack", //feild not in db
      role: user.role || "",
      resetPassLink: "https://example.com/reset", //field not in db
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
