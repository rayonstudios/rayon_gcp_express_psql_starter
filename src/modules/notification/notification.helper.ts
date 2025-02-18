import { THEME_COLOR } from "#/src/lib/constants";
import { prisma } from "#/src/lib/utils/prisma";
import { messaging } from "firebase-admin";
import { MulticastMessage } from "firebase-admin/lib/messaging/messaging-api";
import {
  NotificationBody,
  NotificationEvent,
  NotificationPayload,
  NotificationUser,
} from "./notification.types";

export const getRecepientsUids = async (
  data: NotificationBody
): Promise<string[]> => {
  let uids;
  switch (data.users) {
    case NotificationUser.ADMINS: {
      const admins = await prisma.users.findMany({
        where: {
          role: {
            in: ["admin", "super-admin"],
          },
        },
      });
      uids = admins.map((admin) => admin.id);
      break;
    }
  }
  return uids as string[];
};

export const sendNotification = async (
  uids: string[],
  {
    title,
    body,
    image,
    link,
    data,
    groupId,
  }: {
    title: string;
    body: string;
    image?: string;
    link?: string;
    data?: NotificationPayload;
    groupId?: string;
  }
) => {
  const tokens: string[] = (
    await Promise.all(
      uids.map(async (uid) => {
        try {
          const user = await prisma.users.findUnique({
            where: {
              id: uid,
            },
            select: { fcm_tokens: true },
          });
          return user?.fcm_tokens || [];
        } catch (error) {
          console.error(`Error fetching user with ID ${uid}:`, error);
          return [];
        }
      })
    )
  ).flat();

  const config: MulticastMessage = {
    tokens,
    notification: {
      title,
      body,
    },
    android: {
      collapseKey: groupId,
      priority: "high",
      notification: {
        color: THEME_COLOR,
        sound: "default",
        icon: "/logo192.png",
      },
    },
    apns: {
      payload: {
        aps: {
          "mutable-content": 1,
        },
      },
      fcmOptions: {},
    },
    webpush: {
      headers: {},
      notification: {
        icon: "/logo192.png",
      },
      fcmOptions: {},
    },
    data: data?.data || ({} as any),
  };

  if (link) {
    config.webpush!.fcmOptions!.link = link;
  }
  if (image) {
    config.android!.notification!.imageUrl = image;
    config.apns!.fcmOptions!.imageUrl = image;
    config.webpush!.headers!.image = image;
    config.webpush!.notification!.image = image;
  }

  await Promise.all([
    messaging()
      .sendEachForMulticast(config)
      .catch(() => console.log("Error in sendEachForMulticast")),
    prisma.notifications.create({
      data: {
        title,
        message: body,
        url: image,
        link,
        metadata: data?.data || {},
        eventType: data?.type || NotificationEvent.GENERAL,
        users: uids,
      },
    }),
  ]);

  await prisma.users.updateMany({
    where: {
      id: { in: uids },
    },
    data: { read_count: { increment: 1 } },
  });
};
