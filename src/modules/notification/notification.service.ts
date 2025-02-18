import { BE_URL } from "#/src/lib/constants";
import CloudTask from "#/src/lib/utils/cloudTasks";
import { prisma } from "#/src/lib/utils/prisma";
import { PubSub } from "@google-cloud/pubsub";
import { sendNotification } from "./notification.helper";
import { NotificationEvent, NotificationPayload } from "./notification.types";

const trigger = async (data: NotificationPayload, ignoreErrors = true) => {
  try {
    if (data.timestamp) {
      await CloudTask.add({
        queuePath: process.env.NOTIFICATIONS_QUEUE_PATH!,
        runsAt: data.timestamp,
        url: `${BE_URL}/notifications?api_key=${process.env.API_KEY_SECRET}`,
        httpMethod: "POST",
        body: {
          message: {
            data: Buffer.from(JSON.stringify(data)).toString("base64"),
          },
        } as any,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      await new PubSub({ projectId: process.env.GOOGLE_CLOUD_PROJECT })
        .topic("notifications")
        .publishMessage({
          json: { ...data, ts: Date.now() },
        });
    }
  } catch (error) {
    console.error("Error triggering notification", error);
    if (!ignoreErrors) throw error;
  }
};

const send = async (payload: NotificationPayload) => {
  const { type, data } = payload;

  switch (type) {
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
        const uids = admins.map((admin) => admin.id);

        await sendNotification(uids, {
          title: "New user onboarded",
          body: `A new user has registered with name ${data.name} and email ${data.email}. Please review their details.`,
          data: payload,
        });
      }
      break;

    case NotificationEvent.NEW_POST:
      {
        if (!data) return;

        const users = await prisma.users.findMany();
        const uids = users.map((user) => user.id);

        await sendNotification(uids, {
          title: `New Post Ready for Review`,
          body: `A new post on ${data.title} has been created by ${data.author}. Please review the content and take any necessary actions.`,
          data: payload,
        });
      }
      break;

    case NotificationEvent.GENERAL:
      const { uids, ...updatedData } = data;

      if (!uids) return;

      {
        await sendNotification(uids, {
          title: data.title,
          body: data.message,
          image: data.url,
          data: { ...payload, data: updatedData },
        });
      }
      break;
  }
};

const NotificationService = {
  trigger,
  send,
};

export default NotificationService;
