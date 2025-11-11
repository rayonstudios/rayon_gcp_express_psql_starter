import { GenericObject } from "#/src/lib/types/utils";
import { protos, v2 } from "@google-cloud/tasks";

const { CloudTasksClient } = v2;

type HttpRequest = protos.google.cloud.tasks.v2.ITask["httpRequest"];

type Params = HttpRequest & {
  queuePath: string;
  runsAt: number | Date;
  body?: GenericObject;
};

const add = async ({ queuePath, runsAt, body, ...taskParams }: Params) => {
  const client = new CloudTasksClient();

  const task: GenericObject = {
    httpRequest: taskParams,
    scheduleTime: {
      seconds: new Date(runsAt).getTime() / 1000,
    },
  };

  if (typeof body === "object") {
    task.httpRequest.body = Buffer.from(
      JSON.stringify({
        ...body,
        taskMetadata: {
          scheduledAt: runsAt,
          createdAt: Date.now(),
        },
      })
    ).toString("base64");
    task.headers = task.headers || {};
    if (!task.headers["Content-Type"]) {
      task.headers["Content-Type"] = "application/json";
    }
  }

  const [response] = await client.createTask(
    { parent: queuePath, task },
    { maxRetries: 3 }
  );
  return response.name;
};

const remove = (taskId: string) =>
  new CloudTasksClient().deleteTask({ name: taskId }, { maxRetries: 3 });

const get = async (taskId: string) => {
  const client = new CloudTasksClient();
  const [task] = await client.getTask({ name: taskId });
  return task;
};

const cloudTaskService = {
  add,
  remove,
  get,
};

export default cloudTaskService;
