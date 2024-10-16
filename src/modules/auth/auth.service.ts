import { User } from "#/src/modules/user/user.types";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "#/src/lib/utils/prisma";

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
    { id: user.id },
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

  return new Promise((res, rej) => {
    jwt.verify(token, secret, (err: any, user: any) => {
      if (err) {
        return rej(err);
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

async function invalidateToken(token:string):Promise<boolean>{
  try {
    
    const result = await prisma.tokens.delete({
      where:{
        access_tokens:token
      }
    })

    if(!result) return false
    return true

    
  } catch (error) {
    
    console.error("Error invalidating token:", error);
    return false; // Invalidation failed
  }


}

const authService = {
  invalidateToken,
  generateTokens,
  verifyToken,
  hashPassword,
  verifyPassword,
};

export default authService;
