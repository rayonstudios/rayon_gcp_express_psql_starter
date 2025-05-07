import { PrismaEntityMutable } from "#/src/lib/types/misc";
import { Expand, GenericObject } from "#/src/lib/types/utils";
import { PaginationSortParams, SortFields } from "#/src/lib/utils/pagination";
import { Role } from "#/src/lib/utils/roles";
import { Prisma } from "@prisma/client";

export type Notification = Expand<
  Prisma.notificationsCreateManyInput & {
    metadata?: GenericObject;
  }
>;

type NotificationMutable = PrismaEntityMutable<Notification>;

export type NotificationSortFields = SortFields<Notification, "created_at">;

// endpoint request types
export type NotificationSendGeneral = Expand<
  Omit<NotificationMutable, "event"> & {
    roles?: Role[];
    userIds?: string[];
    metadata?: GenericObject;
  }
>;

export interface NotificationFetchList
  extends PaginationSortParams<NotificationSortFields> {}

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
