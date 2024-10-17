import { Request } from "express";
import { AuthUser } from "./auth.types";

//@ts-ignore
export const getReqUser = (req: Request) => req._user as AuthUser;
