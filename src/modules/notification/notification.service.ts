import cloudTaskService from "#/src/lib/cloud-task/cloud-task.service";
import { BE_URL } from "#/src/lib/constants";
import { GenericObject } from "#/src/lib/types/utils";
import { paginatedQuery } from "#/src/lib/utils/pagination";
import { prisma } from "#/src/lib/utils/prisma";
import { pick } from "lodash";
import { getRecepientsIds, sendNotification } from "./notification.helper";
import {
  NotificationEvent,
  NotificationFetchList,
  NotificationPayload,
  UserNotification,
} from "./notification.types";

const trigger = async (data: NotificationPayload, ignoreErrors = true) => {
  try {
    await cloudTaskService.add({
      queuePath: process.env.GENERAL_TASKS_QUEUE!,
      runsAt: data.timestamp ?? new Date(),
      url: `${BE_URL}/notifications/webhooks/handle-trigger?api_key=${process.env.API_KEY_SECRET}`,
      httpMethod: "POST",
      body: data as any,
      headers: { "Content-Type": "application/json" },
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

  const res = await paginatedQuery<UserNotification>(
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
