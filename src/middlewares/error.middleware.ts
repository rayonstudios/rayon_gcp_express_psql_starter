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
  } else if (err.code === "LIMIT_FILE_SIZE") {
    res.status(statusConst.invalidData.code).json(
      toResponse({
        error: "File size too large. Maximum allowed size is 30MB.",
      })
    );
  } else if (err.code === "LIMIT_FILE_COUNT") {
    res
      .status(statusConst.invalidData.code)
      .json(toResponse({ error: "Too many files uploaded." }));
  } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
    res
      .status(statusConst.invalidData.code)
      .json(toResponse({ error: "Unexpected file field." }));
  } else if (err.__API_ERROR__) {
    res.status(err.code).json(
      toResponse({
        error: err.message,
      })
    );
  } else if (err instanceof Error) {
    res
      .status(statusConst.internal.code)
      .json(toResponse({ error: statusConst.internal.message }));
  }
  console.log("uncaught error:", err);

  next(err);
};

export const apiError = (code: number, message?: string) => {
  if (!message) {
    message =
      Object.values(statusConst).find((e) => e.code === code)?.message ??
      "An unknown error occurred!";
  }

  return { __API_ERROR__: true, code, message };
};
