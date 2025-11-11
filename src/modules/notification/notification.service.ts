import { GenericObject } from "#/src/lib/types/utils";
import { paginatedSortQuery } from "#/src/lib/utils/pagination";
import { prisma } from "#/src/lib/utils/prisma";
import { pick } from "lodash";
import { bgJobsService } from "../bg-jobs/bg-jobs.service";
import { BgJobType } from "../bg-jobs/bg-jobs.types";
import { getRecepientsIds, sendNotification } from "./notification.helper";
import {
  NotificationEvent,
  NotificationFetchList,
  NotificationPayload,
  UserNotification,
} from "./notification.types";

const trigger = async (payload: NotificationPayload, ignoreErrors = true) => {
  try {
    await bgJobsService.create({
      job: BgJobType.SEND_NOTIFICATION,
      payload,
      scheduledFor: payload.timestamp,
    });
  } catch (error) {
    console.error("Error triggering notification", error);
    if (!ignoreErrors) throw error;
  }
};

const send = async (payload: NotificationPayload) => {
  const { event, data } = payload;

  switch (event) {
    case NotificationEvent.SIGN_UP:
      {
        if (!data) return;

        const admins = await prisma.users.findMany({
          where: {
            role: {
              in: ["admin", "super-admin"],
            },
          },
        });
        const userIds = admins.map((admin) => admin.id);

        await sendNotification(userIds, {
          title: "New user onboarded",
          body: `A new user has been registered with name "${data.name}" and email "${data.email}"`,
          event,
          data,
        });
      }
      break;

    case NotificationEvent.NEW_POST:
      {
        if (!data) return;

        const users = await prisma.users.findMany();
        const userIds = users.map((user) => user.id);

        await sendNotification(userIds, {
          title: `New Post Ready for Review`,
          body: `A new post on ${data.title} has been created by ${data.author}. Please review the content and take any necessary actions.`,
          event,
          data,
        });
      }
      break;

    case NotificationEvent.GENERAL:
      const userIds = await getRecepientsIds(data);

      {
        await sendNotification(userIds, {
          title: data.title,
          body: data.body,
          image: data.image,
          link: data.link,
          event,
          data: (data.metadata ?? {}) as GenericObject,
        });
      }
      break;
  }
};

const fetchList = async (
  filters: NotificationFetchList & { userId: string }
) => {
  const query: Parameters<typeof prisma.userNotifications.findMany>[0] = {
    orderBy: { created_at: "desc" },
    where: { user_id: filters.userId },
    include: {
      notification: true,
    },
  };

  const res = await paginatedSortQuery<UserNotification>(
    "userNotifications",
    query,
    pick(filters, ["limit", "page"])
  );
  return res;
};

const markRead = async (userId: string) => {
  await prisma.users.update({
    where: { id: userId },
    data: { unread_noti_count: 0 },
  });
};

const notificationService = {
  trigger,
  send,
  fetchList,
  markRead,
};

export default notificationService;
