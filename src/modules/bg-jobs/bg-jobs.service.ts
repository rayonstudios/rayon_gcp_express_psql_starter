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
    .db()
    .collection(COLLECTIONS.BG_TASKS)
    .doc(taskId)
    .set(data, { merge: true });
};

const get = async (taskId: string): Promise<BgJob | undefined> => {
  const doc = await firebase
    .db()
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
  const taskId = firebase.db().collection(COLLECTIONS.BG_TASKS).doc().id;

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

const handleDemoJob = async (
  taskId: string,
  expectedDuration: number
): Promise<GenericObject> => {
  const startTime = Date.now();
  const updateInterval = 500; // Update progress every 500ms

  // Update progress periodically
  const progressInterval = setInterval(async () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(Math.floor((elapsed / expectedDuration) * 100), 99);

    await save(taskId, {
      resultDetails: { progress },
      updatedAt: new Date(),
    }).catch((err) =>
      console.error(`Failed to update progress for demo job ${taskId}:`, err)
    );
  }, updateInterval);

  // Wait for the expected duration
  await new Promise((resolve) => setTimeout(resolve, expectedDuration));

  // Clear the interval
  clearInterval(progressInterval);

  // Return final result
  return {
    progress: 100,
    completedAt: new Date().toISOString(),
    duration: expectedDuration,
  };
};

const handle = async (
  handlerBody: BgJobData & { taskId: string }
): Promise<GenericObject> => {
  let result: GenericObject = {};
  const { job, payload, taskId } = handlerBody;

  switch (job) {
    case BgJobType.SEND_NOTIFICATION:
      await notificationService.send(payload);
      break;

    case BgJobType.RESIZE_IMAGE:
      result = await fileService.resizeImg(payload);
      break;

    case BgJobType.DEMO_JOB:
      result = await handleDemoJob(taskId, payload.expectedDuration);
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
