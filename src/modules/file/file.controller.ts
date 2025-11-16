import { APIResponse, ExReq, Message } from "#/src/lib/types/misc";
import { toResponse } from "#/src/lib/utils";
import { isImageUrl } from "#/src/lib/utils/file.utils";
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
import { getResizedImages } from "./file.helpers";
import fileService from "./file.service";
import { FileDelete, FileWithImgVariants, Resizeconfig } from "./file.types";

@Route("files")
@Tags("File")
export class FileController extends Controller {
  @Post("/")
  @Security("jwt")
  public async fileSave(
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
  public async fileRemove(
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
}
