import { THEME_COLOR } from "#/src/lib/constants";
import mailService from "#/src/lib/mail/mail.service";
import { GenericObject } from "#/src/lib/types/utils";
import { prisma } from "#/src/lib/utils/prisma";
import { Role } from "#/src/lib/utils/roles";
import { messaging } from "firebase-admin";
import { MulticastMessage } from "firebase-admin/lib/messaging/messaging-api";
import { uniq } from "lodash";
import {
  Notification,
  NotificationEvent,
  NotificationSendGeneral,
} from "./notification.types";

export const getRecepientsIds = async (
  data: NotificationSendGeneral
): Promise<string[]> => {
  const ids = data.userIds ?? [];
  const roles = uniq(data.roles ?? []);
  if (roles.includes(Role.ADMIN) && !roles.includes(Role.SUPER_ADMIN))
    roles.push(Role.SUPER_ADMIN);

  const users = await prisma.users.findMany({
    where: {
      role: {
        in: roles,
      },
    },
    select: { id: true },
  });
  ids.push(...users.map((user) => user.id));

  return uniq(ids);
};

export const sendNotification = async (
  userIds: string[],
  {
    event,
    title,
    body,
    image,
    link,
    data,
    groupId,
  }: {
    data?: GenericObject;
    groupId?: string;
    event: NotificationEvent;
  } & Pick<Notification, "title" | "body" | "image" | "link">
) => {
  if (!userIds.length) return;

  const tokens: string[] = (
    await Promise.all(
      userIds.map(async (id) => {
        try {
          const user = await prisma.users.findUnique({
            where: {
              id,
            },
            select: { fcm_tokens: true },
          });
          return user?.fcm_tokens || [];
        } catch (error) {
          console.error(
            `sendNotification, error fetching user with ID ${id}:`,
            error
          );
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
        // icon: "/logo192.png",
      },
      fcmOptions: {},
    },
    data: data || {},
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

  const [dbNotification] = await Promise.all([
    // In App notification
    prisma.notifications.create({
      data: {
        title,
        body,
        image,
        link,
        metadata: data || {},
        event: event,
      },
    }),
    // Push notification
    tokens.length
      ? messaging()
          .sendEachForMulticast(config)
          .catch((e) => console.log("Error in sendEachForMulticast:", e))
      : Promise.resolve(),
    // Email notification
    mailService.send({
      to: userIds,
      template: mailService.templates.notification.general({
        title,
        body,
        image: image || undefined,
        link: link || undefined,
      }),
    }),
  ]);

  // Create user notifications to be used to fetch later
  await prisma.userNotifications.createMany({
    data: userIds.map((id) => ({
      notification_id: dbNotification.id,
      user_id: id,
    })),
  });

  // Increment unread notification count for each user
  await prisma.users.updateMany({
    where: {
      id: { in: userIds },
    },
    data: { unread_noti_count: { increment: 1 } },
  });
};
