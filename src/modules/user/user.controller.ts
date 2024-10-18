import { APIResponse } from "#/src/lib/types/misc";
import { toResponse } from "#/src/lib/utils";
import { errorConst } from "#/src/lib/utils/error";
import { PaginationResponse } from "#/src/lib/utils/pagination";
import { Role } from "#/src/lib/utils/roles";
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
  Route,
  Security,
  Tags,
} from "tsoa";
import { sanitizeUser } from "./user.helpers";
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
      this.setStatus(errorConst.notFound.code);
      return toResponse({ error: errorConst.notFound.message });
    }

    return toResponse({ data: sanitizeUser(user) });
  }

  @Get("/")
  public async fetchList(
    @Queries()
    query: UserFetchList
  ): Promise<APIResponse<PaginationResponse<SanitizedUser>>> {
    const res = await userService.fetchList(query);
    return toResponse({
      data: { ...res, list: res.list.map(sanitizeUser) },
    });
  }

  @Post()
  @Middlewares(validateData(userValidations.create)) // route level middlewares
  public async create(
    @Body() body: UserCreate & { password: string }
  ): Promise<APIResponse<SanitizedUser>> {
    const user = await userService.create(body);
    if (!user) {
      this.setStatus(errorConst.notFound.code);
      return toResponse({ error: errorConst.notFound.message });
    }

    this.setStatus(201);
    return toResponse({ data: sanitizeUser(user) });
  }

  @Patch("{userId}")
  public async update(
    @Path() userId: string,
    @Body() body: UserUpdate
  ): Promise<APIResponse<SanitizedUser>> {
    const user = await userService.update(userId, body);
    if (!user) {
      this.setStatus(errorConst.notFound.code);
      return toResponse({ error: errorConst.notFound.message });
    }

    return toResponse({ data: sanitizeUser(user) });
  }

  @Delete("{userId}")
  public async remove(
    @Path() userId: string
  ): Promise<APIResponse<SanitizedUser>> {
    const user = await userService.remove(userId);
    if (!user) {
      this.setStatus(errorConst.notFound.code);
      return toResponse({ error: errorConst.notFound.message });
    }

    return toResponse({ data: sanitizeUser(user) });
  }
}
