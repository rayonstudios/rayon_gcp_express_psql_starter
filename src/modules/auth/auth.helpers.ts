import { ExReq } from "#/src/lib/types/misc";
import { AuthUser } from "./auth.types";

//@ts-ignore
export const getReqUser = (req: ExReq) => req._user as AuthUser;
