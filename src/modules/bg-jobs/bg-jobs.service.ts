import cloudTaskService from "#/src/lib/cloud-task/cloud-task.service";
import { BE_URL } from "#/src/lib/constants";
import { firebase } from "#/src/lib/firebase/firebase.service";
import { COLLECTIONS } from "#/src/lib/firebase/firebase.types";
import { GenericObject } from "#/src/lib/types/utils";
import fileService from "../file/file.service";
import notificationService from "../notification/notification.service";
import { BgJob, BgJobData, BgJobStatus, BgJobType } from "./bg-jobs.types";

const save = async (taskId: string, data: Partial<BgJob>) => {
  await firebase
    .firestore()
    .collection(COLLECTIONS.BG_TASKS)
    .doc(taskId)
    .set(data, { merge: true });
};

const get = async (taskId: string): Promise<BgJob | undefined> => {
  const doc = await firebase
    .firestore()
    .collection(COLLECTIONS.BG_TASKS)
    .doc(taskId)
    .get();

  return doc.exists
    ? ({
        ...doc.data(),
        createdAt: doc.createTime?.toDate(),
        updatedAt: doc.updateTime?.toDate(),
      } as BgJob)
    : undefined;
};

const create = async (jobData: BgJobData) => {
  const { job, payload, createdBy, scheduledFor } = jobData;

  // Create a new task id in Firestore
  const taskId = firebase.firestore().collection(COLLECTIONS.BG_TASKS).doc().id;

  const runsAt = scheduledFor || new Date();

  // Save the job record FIRST to avoid race condition where Cloud Task executes
  // before the record exists in Firestore
  await save(taskId, {
    status: BgJobStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: createdBy || null,
    job,
    ...(scheduledFor && { scheduledFor }),
  });

  // Create Cloud Task AFTER record exists
  await cloudTaskService.add({
    queuePath: process.env.GENERAL_TASKS_QUEUE!,
    runsAt,
    url: `${BE_URL}/bg-jobs/handler?api_key=${process.env.API_KEY_SECRET}`,
    httpMethod: "POST",
    body: {
      payload,
      job,
      taskId,
    } as any,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return taskId;
};

const handle = async ({ job, payload }: BgJobData) => {
  let result: GenericObject = {};

  switch (job) {
    case BgJobType.SEND_NOTIFICATION:
      await notificationService.send(payload);
      break;

    case BgJobType.RESIZE_IMAGE:
      result = await fileService.resizeImg(payload);
      break;

    default:
      break;
  }

  return result;
};

export const bgJobsService = {
  save,
  get,
  create,
  handle,
};
