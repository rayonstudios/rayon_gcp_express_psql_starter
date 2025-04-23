import { Request, Response } from "express";
import { toResponse } from "../lib/utils";
import { statusConst } from "../lib/utils/status";

export const notFoundMiddleware = (_: Request, res: Response) => {
  res
    .status(statusConst.notFound.code)
    .json(toResponse({ error: statusConst.notFound.message }));
};
