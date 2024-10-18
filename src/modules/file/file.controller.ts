import { APIResponse, ExReq, Message } from "#/src/lib/types/misc";
import { toResponse } from "#/src/lib/utils";
import { errorConst } from "#/src/lib/utils/error";
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
import fileService from "./file.service";

@Route("files")
@Tags("Files")
@Security("jwt")
export class FileController extends Controller {
  @Post("/")
  public async create(
    @UploadedFile() file: Express.Multer.File
  ): Promise<APIResponse<{ url: string }>> {
    const [url] = await fileService.save([{ ...file, createdBy: "" }]);

    this.setStatus(201);
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
      this.setStatus(errorConst.unAuthorized.code);
      return toResponse({ error: errorConst.unAuthorized.message });
    }

    await file.delete();
    return toResponse({ data: { message: "File deleted successfully" } });
  }
}
