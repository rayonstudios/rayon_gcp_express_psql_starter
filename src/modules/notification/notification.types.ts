import { PrismaEntityMutable } from "#/src/lib/types/misc";
import { Expand } from "#/src/lib/types/utils";
import { PaginationParams } from "#/src/lib/utils/pagination";
import { Role } from "#/src/lib/utils/roles";
import { Prisma } from "@prisma/client";

export type Notification = Prisma.notificationsCreateManyInput;

type NotificationMutable = PrismaEntityMutable<Notification>;

// endpoint request types
export type NotificationSendGeneral = Expand<
  Omit<NotificationMutable, "event"> & {
    roles?: Role[];
    userIds?: string[];
  }
>;

export type UserNotificationUnlinked = Prisma.userNotificationsCreateManyInput;
export type UserNotification = Expand<
  UserNotificationUnlinked & {
    notification: Notification;
  }
>;

export interface NotificationFetchList extends PaginationParams {}

export enum NotificationEvent {
  GENERAL = "general",
  SIGN_UP = "sign-up",
  NEW_POST = "new-post",
}

export type NotificationPayload = {
  timestamp?: number;
} & (
  | {
      event: NotificationEvent.GENERAL;
      data: NotificationSendGeneral;
    }
  | {
      event: NotificationEvent.SIGN_UP;
      data: {
        name: string;
        email: string;
      };
    }
  | {
      event: NotificationEvent.NEW_POST;
      data: {
        author: string;
        title: string;
      };
    }
);
