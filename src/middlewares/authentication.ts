import { NextFunction, Request, Response } from "express";
import { toResponse } from "../lib/utils";
import { errorConst } from "../lib/utils/error";
import authService from "../modules/auth/auth.service";
import { AuthUser } from "../modules/auth/auth.types";

export const validateAuthentication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  const type = req.originalUrl.endsWith("/refresh") ? "refresh" : "access";
  const sendUnAuthResponse = () =>
    res.status(errorConst.unAuthenticated.code).json(
      toResponse({
        error: errorConst.unAuthenticated.message,
      })
    );

  if (!token) return sendUnAuthResponse();

  const user = await authService.verifyToken(token, type);
  if (!user) return sendUnAuthResponse();

  res.locals.user = user as AuthUser;
  next();
};
