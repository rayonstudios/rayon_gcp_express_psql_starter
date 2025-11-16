import { PrismaEntityMutable } from "#/src/lib/types/misc";
import { Expand, GenericObject } from "#/src/lib/types/utils";
import { PaginationSortParams } from "#/src/lib/utils/pagination";
import { Role } from "#/src/lib/utils/roles";
import { Prisma } from "@prisma/client";

export type Notification = Expand<
  Prisma.notificationsCreateManyInput & {
    metadata?: GenericObject;
  }
>;

type NotificationMutable = PrismaEntityMutable<Notification>;

// endpoint request types
export type NotificationSendGeneral = Expand<
  Omit<NotificationMutable, "event"> & {
    roles?: Role[];
    userIds?: string[];
    metadata?: GenericObject;
  }
>;

export interface NotificationFetchList extends PaginationSortParams {}

export type UserNotificationUnlinked = Prisma.userNotificationsCreateManyInput;
export type UserNotification = Expand<
  UserNotificationUnlinked & {
    notification: Notification;
  }
>;

export enum NotificationEvent {
  GENERAL = "general",
  SIGN_UP = "sign-up",
  NEW_POST = "new-post",
}

export type NotificationPayload = {
  timestamp?: Date;
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
