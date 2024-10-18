import { Request } from "express";
import { statusConst } from "../lib/utils/status";
import authService from "../modules/auth/auth.service";
import { AuthUser } from "../modules/auth/auth.types";

export const expressAuthentication = async (
  req: Request,
  securityName: string,
  scopes?: string[]
) => {
  if (securityName === "jwt") {
    const token = req.headers.authorization?.split(" ")[1];
    const type = req.originalUrl.endsWith("/refresh") ? "refresh" : "access";
    const sendUnAuthResponse = () =>
      Promise.reject({ code: statusConst.unAuthenticated.code });

    if (!token) return sendUnAuthResponse();

    const user = (await authService.verifyToken(token, type)) as AuthUser;
    if (!user) return sendUnAuthResponse();

    if (scopes?.length && !scopes.includes(user.role)) {
      return Promise.reject({ code: statusConst.unAuthorized.code });
    }

    //@ts-ignore
    req._user = user;
    return user;
  }
};