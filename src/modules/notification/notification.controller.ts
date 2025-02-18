import { APIResponse, ExReq, Message } from "#/src/lib/types/misc";
import { toResponse } from "#/src/lib/utils";
import { PaginationResponse } from "#/src/lib/utils/pagination";
import { Role } from "#/src/lib/utils/roles";
import { statusConst } from "#/src/lib/utils/status";
import { validateData } from "#/src/middlewares/validation.middleware";
import {
  Body,
  Controller,
  Get,
  Middlewares,
  Post,
  Queries,
  Request,
  Route,
  Security,
  Tags,
} from "tsoa";
import { getRecepientsUids } from "./notification.helper";
import NotificationSerializer from "./notification.serializer";
import NotificationService from "./notification.service";
import {
  Notification,
  NotificationBody,
  NotificationEvent,
  NotificationFetchList,
} from "./notification.types";
import NotificationValidations from "./notification.validations";

@Route("notifications")
@Tags("Notification")
export class NotificationController extends Controller {
  @Post("/")
  @Security("api_key")
  public async send(@Request() req: ExReq) {
    const json = JSON.parse(
      Buffer.from(req.body.message.data, "base64").toString("utf-8")
    );

    await NotificationService.send(json);
    return toResponse({ data: "Notification sent!" });
  }

  @Post("/general")
  @Security("jwt", [Role.ADMIN])
  @Middlewares(validateData(NotificationValidations.general))
  public async general(
    @Body() body: NotificationBody
  ): Promise<APIResponse<Message>> {
    const uids = await getRecepientsUids(body);
    if (!uids) {
      this.setStatus(statusConst.notFound.code);
      return toResponse({ error: statusConst.notFound.message });
    }

    await NotificationService.trigger({
      type: NotificationEvent.GENERAL,
      data: {
        uids,
        ...body,
        url: body.url ?? "",
        link: body.link ?? "",
      },
    });
    return toResponse({ data: { message: "Notification sent successfully" } });
  }

  @Get("/")
  @Security("jwt", [Role.ADMIN])
  public async fetchList(
    @Queries() query: NotificationFetchList
  ): Promise<APIResponse<PaginationResponse<Notification>>> {
    const res = await NotificationService.fetchList(query);
    return toResponse({ data: NotificationSerializer.paginated(res) });
  }
}
