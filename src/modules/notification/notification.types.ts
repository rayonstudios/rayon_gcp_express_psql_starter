import { PrismaEntityMutable } from "#/src/lib/types/misc";
import { Expand } from "#/src/lib/types/utils";
import { Prisma } from "@prisma/client";

export type Notification = Prisma.notificationsCreateManyInput;

type NotificationMutable = PrismaEntityMutable<Notification>;

export type NotificationCreate = NotificationMutable;

export type NotificationBody = Expand<
  Omit<NotificationCreate, "eventType" | "users" | "metadata"> & {
    users: string;
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
      type: NotificationEvent.GENERAL;
      data: {
        uids?: string[];
        title: string;
        message: string;
        url?: string;
        link?: string;
      };
    }
  | {
      type: NotificationEvent.SIGN_UP;
      data: {
        name: string;
        email: string;
      };
    }
  | {
      type: NotificationEvent.NEW_POST;
      data: {
        author: string;
        title: string;
      };
    }
);

export enum NotificationUser {
  ADMINS = "admins",
  ALL = "all",
}
