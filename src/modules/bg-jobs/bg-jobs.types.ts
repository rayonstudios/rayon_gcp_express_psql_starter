import { Expand, GenericObject } from "#/src/lib/types/utils";
import { FileResizeImgInput } from "../file/file.types";
import { NotificationPayload } from "../notification/notification.types";

export enum BgJobType {
  SEND_NOTIFICATION = "send-notification",
  RESIZE_IMAGE = "resize-image",
}

export type BgJobData = { createdBy?: string; scheduledFor?: Date } & (
  | {
      job: BgJobType.SEND_NOTIFICATION;
      payload: NotificationPayload;
    }
  | {
      job: BgJobType.RESIZE_IMAGE;
      payload: FileResizeImgInput;
    }
);

export enum BgJobStatus {
  PENDING = "pending",
  IN_PROGRESS = "in-progress",
  SUCCESS = "success",
  FAILED = "failed",
}

export type BgJobHandlerBody = Expand<
  BgJobData & { taskId: string; taskMetadata: GenericObject }
>;

export type BgJob = {
  status: BgJobStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  job: BgJobType;
  scheduledFor?: Date;
  resultDetails?: GenericObject;
  errorMessage?: string;
};
