import { APIResponse, ExReq } from "#/src/lib/types/misc";
import { toResponse } from "#/src/lib/utils";
import { PaginationResponse } from "#/src/lib/utils/pagination";
import { isAdminRole, isSuperAdminRole, Role } from "#/src/lib/utils/roles";
import { statusConst } from "#/src/lib/utils/status";
import { validateData } from "#/src/middlewares/validation.middleware";
import {
  Body,
  Controller,
  Delete,
  Get,
  Middlewares,
  Patch,
  Path,
  Post,
  Queries,
  Request,
  Route,
  Security,
  Tags,
} from "tsoa";
import { getReqUser } from "../auth/auth.helpers";
import otpService from "../otp/otp.service";
import userSerializer from "./user.serializer";
import userService from "./user.service";
import {
  SanitizedUser,
  UserCreate,
  UserFetchList,
  UserUpdate,
} from "./user.types";
import userValidations from "./user.validations";

@Route("users")
@Tags("User")
@Security("jwt", [Role.ADMIN])
export class UserController extends Controller {
  @Get("{userId}")
  public async fetch(
    @Path() userId: string
  ): Promise<APIResponse<SanitizedUser>> {
    const user = await userService.fetch(userId);
    if (!user) {
      this.setStatus(statusConst.notFound.code);
      return toResponse({ error: statusConst.notFound.message });
    }

    return toResponse({ data: userSerializer.single(user) });
  }

  @Get("/")
  public async fetchList(
    @Queries()
    query: UserFetchList
  ): Promise<APIResponse<PaginationResponse<SanitizedUser>>> {
    const res = await userService.fetchList(query);
    return toResponse({
      data: userSerializer.paginated(res),
    });
  }

  @Post("/")
  @Middlewares(validateData(userValidations.create)) // route level middlewares
  public async create(
    @Body() body: UserCreate,
    @Request() req: ExReq
  ): Promise<APIResponse<SanitizedUser>> {
    const reqUser = getReqUser(req);

    const existingUser = await userService.fetchByEmail(body.email);
    if (existingUser) {
      this.setStatus(statusConst.alreadyExists.code);
      return toResponse({ error: statusConst.alreadyExists.message });
    }

    if (isAdminRole(body.role || "") && !isSuperAdminRole(reqUser.role)) {
      this.setStatus(statusConst.unAuthorized.code);
      return toResponse({ error: statusConst.unAuthorized.message });
    }

    const user = await userService.create({ ...body, password: "" });
    await otpService.send(user, "inviteUser");

    this.setStatus(statusConst.created.code);
    return toResponse({ data: userSerializer.single(user) });
  }

  @Patch("{userId}")
  public async update(
    @Path() userId: string,
    @Body() body: UserUpdate,
    @Request() req: ExReq
  ): Promise<APIResponse<SanitizedUser>> {
    const reqUser = getReqUser(req);

    const existingUser = await userService.fetch(userId);
    if (!existingUser) {
      this.setStatus(statusConst.notFound.code);
      return toResponse({ error: statusConst.notFound.message });
    }

    if (
      (isAdminRole(existingUser.role) || isAdminRole(body.role || "")) &&
      !isSuperAdminRole(reqUser.role)
    ) {
      this.setStatus(statusConst.unAuthorized.code);
      return toResponse({ error: statusConst.unAuthorized.message });
    }

    const user = await userService.update(userId, body);
    return toResponse({ data: userSerializer.single(user) });
  }

  @Delete("{userId}")
  public async remove(
    @Path() userId: string
  ): Promise<APIResponse<SanitizedUser>> {
    const user = await userService.remove(userId);
    return toResponse({ data: userSerializer.single(user) });
  }
}
