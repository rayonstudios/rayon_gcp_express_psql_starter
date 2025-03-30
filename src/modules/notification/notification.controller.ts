import { APIResponse, ExReq, Message } from "#/src/lib/types/misc";
import { toResponse } from "#/src/lib/utils";
import { PaginationResponse } from "#/src/lib/utils/pagination";
import { Role } from "#/src/lib/utils/roles";
import { statusConst } from "#/src/lib/utils/status";
import {
  Body,
  Controller,
  Get,
  Post,
  Queries,
  Request,
  Route,
  Security,
  Tags,
} from "tsoa";
import { getReqUser } from "../auth/auth.helpers";
import notificationSerializer from "./notification.serializer";
import notificationService from "./notification.service";
import {
  NotificationEvent,
  NotificationFetchList,
  NotificationPayload,
  NotificationSendGeneral,
  UserNotification,
} from "./notification.types";

@Route("notifications")
@Tags("Notification")
export class NotificationController extends Controller {
  @Post("/webhooks/handle-trigger")
  @Security("api_key")
  public async handleTrigger(
    @Body() body: NotificationPayload
  ): Promise<APIResponse<Message>> {
    await notificationService.send(body);
    return toResponse({ data: { message: "Notification sent!" } });
  }

  @Post("/general")
  @Security("jwt", [Role.ADMIN])
  public async sendGeneral(
    @Body() body: NotificationSendGeneral
  ): Promise<APIResponse<Message>> {
    if (!body.userIds?.length && !body.roles?.length) {
      this.setStatus(statusConst.invalidData.code);
      return toResponse({
        error: "At least one of userIds or roles is required",
      });
    }

    await notificationService.trigger({
      event: NotificationEvent.GENERAL,
      data: body,
    });
    return toResponse({ data: { message: "Notification sent!" } });
  }

  @Get("/")
  @Security("jwt")
  public async fetchList(
    @Request() req: ExReq,
    @Queries() query: NotificationFetchList
  ): Promise<APIResponse<PaginationResponse<UserNotification>>> {
    const { id } = getReqUser(req);

    const res = await notificationService.fetchList({ ...query, userId: id });
    return toResponse({ data: notificationSerializer.paginated(res) });
  }

  @Post("/mark-read")
  @Security("jwt")
  public async markRead(@Request() req: ExReq): Promise<APIResponse<Message>> {
    const { id } = getReqUser(req);

    await notificationService.markRead(id);
    return toResponse({ data: { message: "Marked as read!" } });
  }
}
