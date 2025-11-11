import { ExReq } from "#/src/lib/types/misc";
import { getIp, isCloudRun } from "#/src/lib/utils";
import { User } from "#/src/modules/user/user.types";
import bcrypt from "bcrypt";
import { verify } from "hcaptcha";
import jwt from "jsonwebtoken";

async function generateTokens(user: User) {
  if (
    !process.env.ACCESS_TOKEN_SECRET ||
    !process.env.REFRESH_TOKEN_SECRET ||
    !process.env.ACCESS_TOKEN_LIFE ||
    !process.env.REFRESH_TOKEN_LIFE
  )
    return null;

  const accessToken = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_LIFE,
    }
  );
  const refreshToken = jwt.sign(
    { id: user.id, refresh_token_version: user.refresh_token_version },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_LIFE }
  );
  return { accessToken, refreshToken };
}

async function verifyToken(token: string, type: "access" | "refresh") {
  const secret =
    type === "access"
      ? process.env.ACCESS_TOKEN_SECRET
      : process.env.REFRESH_TOKEN_SECRET;
  if (!secret) return null;

  return new Promise((res) => {
    jwt.verify(token, secret, (err: any, user: any) => {
      if (err) {
        return res(null);
      }
      return res(user);
    });
  });
}

async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(password, salt);
}

async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

async function verifyHcaptcha(hcaptcha_token: string, req: ExReq) {
  if (
    !isCloudRun() ||
    !process.env.HCAPTCHA_SECRET ||
    !process.env.HCAPTCHA_SITE_KEY
  )
    return true;

  if (!hcaptcha_token) return false;

  const { success } = await verify(
    process.env.HCAPTCHA_SECRET,
    hcaptcha_token,
    getIp(req),
    process.env.HCAPTCHA_SITE_KEY
  );

  return success;
}

const authService = {
  generateTokens,
  verifyToken,
  hashPassword,
  verifyPassword,
  verifyHcaptcha,
};

export default authService;
