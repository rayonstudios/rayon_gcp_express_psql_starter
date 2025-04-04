import { APIResponse, ExReq, Message } from "#/src/lib/types/misc";
import { toResponse } from "#/src/lib/utils";
import { prisma } from "#/src/lib/utils/prisma";
import { statusConst } from "#/src/lib/utils/status";
import {
  Body,
  Controller,
  Delete,
  FormField,
  Post,
  Request,
  Route,
  Security,
  Tags,
  UploadedFile,
} from "tsoa";
import { getReqUser } from "../auth/auth.helpers";
import { getResizedImages, isImageUrl } from "./file.helpers";
import fileService from "./file.service";
import {
  FileDelete,
  FileWebhookHandleResize,
  FileWithImgVariants,
  Resizeconfig,
} from "./file.types";

@Route("files")
@Tags("Files")
export class FileController extends Controller {
  @Post("/")
  @Security("jwt")
  public async create(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: ExReq,
    @FormField() img_sizes?: string
  ): Promise<APIResponse<FileWithImgVariants>> {
    const reqUser = getReqUser(req);
    let sizes = {};

    const [url] = await fileService.save([{ ...file, createdBy: reqUser.id }]);

    if (img_sizes && isImageUrl(url)) {
      sizes = await getResizedImages(
        url,
        img_sizes.split(",") as unknown as Resizeconfig["sizes"]
      );
    }

    this.setStatus(statusConst.created.code);
    return toResponse({
      data: Object.keys(sizes).length ? { url, img_sizes: sizes } : { url },
    });
  }

  @Delete("/")
  @Security("jwt")
  public async remove(
    @Request() req: ExReq,
    @Body() body: FileDelete
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
  @Security("api_key")
  public async handleImageResize(
    @Body()
    body: FileWebhookHandleResize
  ): Promise<APIResponse<Message>> {
    const urlsMap = await getResizedImages(
      body.url,
      body.resize_config.sizes,
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
