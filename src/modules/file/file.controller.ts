import { APIResponse } from "#/src/lib/types/misc";
import { toResponse } from "#/src/lib/utils";
import { errorConst } from "#/src/lib/utils/error";
import { validateAuthentication } from "#/src/middlewares/authentication";
import {
  Body,
  Controller,
  Delete,
  Middlewares,
  Post,
  Route,
  Tags,
  UploadedFile,
} from "tsoa";
import fileService from "./file.service";

@Route("files")
@Tags("Files")
@Middlewares(validateAuthentication)
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
    @Body() body: { url: string }
  ): Promise<APIResponse<string>> {
    const file = await fileService.fetch(body.url);
    if (file.metadata.metadata?.createdBy !== getReqUser(res).id) {
      this.setStatus(errorConst.unAuthorized.code);
      return toResponse({ error: errorConst.unAuthorized.message });
    }

    await file.delete();
    return toResponse({ data: "File deleted successfully" });
  }
}
