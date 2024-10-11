import { APIResponse } from "#/src/lib/types/misc";
import { toResponse } from "#/src/lib/utils";
import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Path,
  Post,
  Queries,
  Route,
} from "tsoa";
import userService from "./user.service";
import { User, UserCreate, UserFetchList, UserUpdate } from "./user.types";

@Route("users")
export class UserController extends Controller {
  @Get("{userId}")
  public async fetch(@Path() userId: string): Promise<APIResponse<User>> {
    const user = await userService.fetch(userId);
    if (!user) {
      this.setStatus(404);
      return toResponse({ error: "User not found" });
    }
    return toResponse({ data: user });
  }

  @Get("/")
  public async fetchList(
    @Queries() query: UserFetchList
  ): Promise<APIResponse<User[]>> {
    const users = await userService.fetchList(query);
    return toResponse({ data: users });
  }

  @Post()
  public async create(@Body() body: UserCreate): Promise<APIResponse<User>> {
    const user = await userService.create(body);
    this.setStatus(201);
    return toResponse({ data: user });
  }

  @Patch("{userId}")
  public async update(
    @Path() userId: string,
    @Body() body: UserUpdate
  ): Promise<APIResponse<User>> {
    const user = await userService.update(userId, body);
    return toResponse({ data: user });
  }

  @Delete("{userId}")
  public async remove(
    @Path() userId: string
  ): Promise<APIResponse<User | null>> {
    const user = await userService.remove(userId);
    return toResponse({ data: user });
  }
}
