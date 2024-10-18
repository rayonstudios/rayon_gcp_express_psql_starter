import { toResponse } from "#/src/lib/utils";
import { errorConst } from "#/src/lib/utils/error";
import { Role } from "#/src/lib/utils/roles";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";

type RoleValidation<T extends z.ZodRawShape> = {
  schema: z.ZodObject<T>;
  roles: Role[];
};

export function validateData<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  isBody: boolean = true
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.safeParse(isBody ? req.body : req.query);

    if (error) {
      return res
        .status(errorConst.invalidData.code)
        .json(toResponse({ error: error.message }));
    } else next();
  };
}

export function validateByRole<T extends z.ZodRawShape>(
  validations: RoleValidation<T>[],
  isBody: boolean = true
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userRole = res.locals.user?.role;
    const validation = validations.find((v) => v.roles.includes(userRole));
    if (!validation) {
      return res.status(errorConst.unAuthorized.code).json(
        toResponse({
          error: errorConst.unAuthorized.message,
        })
      );
    }

    const { error } = validation.schema.safeParse(
      isBody ? req.body : req.query
    );

    if (error) {
      return res
        .status(errorConst.invalidData.code)
        .json(toResponse({ error: error.message }));
    } else next();
  };
}
