import { APIResponse, ExReq, Message } from "#/src/lib/types/misc";
import { GenericObject } from "#/src/lib/types/utils";
import { toResponse } from "#/src/lib/utils";
import { prisma } from "#/src/lib/utils/prisma";
import { statusConst } from "#/src/lib/utils/status";
import {
  Body,
  Controller,
  Delete,
  Post,
  Request,
  Route,
  Security,
  Tags,
  UploadedFile,
} from "tsoa";
import { getReqUser } from "../auth/auth.helpers";
import { getResizedImages } from "./file.helpers";
import fileService from "./file.service";
import { Resizeconfig } from "./file.types";

@Route("files")
@Tags("Files")
@Security("jwt")
export class FileController extends Controller {
  @Post("/")
  public async create(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: ExReq
  ): Promise<APIResponse<{ url: string }>> {
    const reqUser = getReqUser(req);
    const [url] = await fileService.save([{ ...file, createdBy: reqUser.id }]);

    this.setStatus(statusConst.created.code);
    return toResponse({
      data: { url },
    });
  }

  @Delete("/")
  public async remove(
    @Request() req: ExReq,
    @Body() body: { url: string }
  ): Promise<APIResponse<Message>> {
    const file = await fileService.fetch(body.url);
    if (file.metadata.metadata?.createdBy !== getReqUser(req).id) {
      this.setStatus(statusConst.unAuthorized.code);
      return toResponse({ error: statusConst.unAuthorized.message });
    }

    await file.delete();
    return toResponse({ data: { message: "File deleted successfully" } });
  }

  @Post("/webhooks/handle-img-resize")
  public async handleImageResize(
    @Body()
    body: { url: string; resize_config: Resizeconfig } & {
      taskMetadata: GenericObject;
    }
  ): Promise<APIResponse<Message>> {
    const urlsMap = await getResizedImages(
      body.url,
      body.resize_config.sizes.split(",") as any,
      `${body.resize_config.model}_${body.resize_config.record_id}_${body.resize_config.img_field}.jpg`
    );

    // update the document field with the new urls
    const updates = { [`${body.resize_config.img_field}_sizes`]: urlsMap };
    await (prisma[body.resize_config.model] as any).update({
      where: { id: body.resize_config.record_id },
      data: updates,
    });

    this.setStatus(statusConst.success.code);
    return toResponse({
      data: { message: "Image resized successfully" },
    });
  }
}
