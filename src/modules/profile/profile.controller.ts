import { APIResponse } from "#/src/lib/types/misc";
import { toResponse } from "#/src/lib/utils";
import { statusConst } from "#/src/lib/utils/status";
import { Request as ExpressRequest } from "express";
import {
  Controller,
  Delete,
  FormField,
  Get,
  Patch,
  Request,
  Route,
  Security,
  Tags,
  UploadedFile,
} from "tsoa";
import { getReqUser } from "../auth/auth.helpers";
import fileService from "../file/file.service";
import { sanitizeUser } from "../user/user.helpers";
import userService from "../user/user.service";
import { SanitizedUser } from "../user/user.types";
import { profileService } from "./profile.services";

@Route("profile")
@Tags("Profile")
@Security("jwt")
export class ProfileController extends Controller {
  @Get("/")
  public async fetch(
    @Request() req: ExpressRequest
  ): Promise<APIResponse<SanitizedUser>> {
    const reqUser = getReqUser(req);

    const user = await userService.fetch(reqUser.id);
    if (!user) {
      this.setStatus(statusConst.notFound.code);
      return toResponse({ error: statusConst.notFound.message });
    }

    return toResponse({ data: sanitizeUser(user) });
  }

  @Patch("/")
  public async update(
    @Request() req: ExpressRequest,
    @FormField() name?: string,
    @FormField() bio?: string,
    @FormField() added_fcm_token?: string,
    @FormField() removed_fcm_token?: string,
    @UploadedFile() photo?: Express.Multer.File
  ): Promise<APIResponse<SanitizedUser>> {
    const reqUser = getReqUser(req);

    let photoUrl = "";
    if (photo) {
      [photoUrl] = await fileService.save([photo]);
    }

    const data = {
      name,
      bio,
      photo: photoUrl,
      added_fcm_token,
      removed_fcm_token,
    };

    const filteredData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, v]) => ![undefined, null, ""].includes(v)
      )
    );

    const user = await profileService.update(reqUser.id, filteredData);
    if (!user) {
      this.setStatus(statusConst.notFound.code);
      return toResponse({ error: statusConst.notFound.message });
    }

    return toResponse({ data: sanitizeUser(user) });
  }

  @Delete("/")
  public async delete(
    @Request() req: ExpressRequest
  ): Promise<APIResponse<SanitizedUser>> {
    const reqUser = getReqUser(req);
    const user = await userService.remove(reqUser.id);
    if (!user) {
      this.setStatus(statusConst.notFound.code);
      return toResponse({ error: statusConst.notFound.message });
    }

    return toResponse({ data: sanitizeUser(user) });
  }
}
