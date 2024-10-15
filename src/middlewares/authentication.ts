import { NextFunction, Request, Response } from "express";
import { toResponse } from "../lib/utils";
import { errorConst } from "../lib/utils/error";
import authService from "../modules/auth/auth.service";

export const validateAuthentication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  const type = req.originalUrl.endsWith("/refresh") ? "refresh" : "access";
  if (!token || !(await authService.verifyToken(token, type))) {
    return res.status(errorConst.unAuthenticated.code).json(
      toResponse({
        error: errorConst.unAuthenticated.message,
      })
    );
  }
  next();
};
