import { NextFunction, Request, Response } from "express";
import { ValidateError } from "tsoa";
import { toResponse } from "../lib/utils";
import { statusConst } from "../lib/utils/status";

export const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ValidateError) {
    res
      .status(statusConst.invalidData.code)
      .json(toResponse({ error: JSON.stringify(err.fields) }));
  } else if (err instanceof Error) {
    res
      .status(statusConst.internal.code)
      .json(toResponse({ error: statusConst.internal.message }));
  } else if (err.code) {
    res.status(err.code).json(
      toResponse({
        error: Object.values(statusConst).find((e) => e.code === err.code)
          ?.message,
      })
    );
  }
  console.log("error", err);

  next(err);
};
