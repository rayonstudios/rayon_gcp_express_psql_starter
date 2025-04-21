import cloudTaskService from "#/src/lib/cloud-task/cloud-task.service";
import { BE_URL } from "#/src/lib/constants";
import { pathFromUrl } from "#/src/lib/utils/file.utils";
import * as admin from "firebase-admin";
import { uploadFile } from "./file.helpers";
import { FileUpload, Resizeconfig } from "./file.types";

admin.initializeApp({
  storageBucket: process.env.STORAGE_BUCKET,
});
export const bucket = admin.storage().bucket();

const fetch = async (fileUrl: string) => {
  const bucket = admin.storage().bucket();
  const filePath = pathFromUrl(fileUrl);

  const [file] = await bucket.file(filePath).get();
  return file;
};

const save = async (files: FileUpload[], overwrite = false) => {
  const urls = await Promise.all(
    files.map((file) => uploadFile(file, overwrite))
  );
  return urls;
};

const remove = async (fileUrl: string) => {
  const filePath = pathFromUrl(fileUrl);

  await bucket.file(filePath).delete();
};

const resizeImg = async (url: string, resizeConfig: Resizeconfig) => {
  await cloudTaskService.add({
    queuePath: process.env.GENERAL_TASKS_QUEUE!,
    runsAt: new Date(), // Run immediately
    url: `${BE_URL}/files/webhooks/handle-img-resize?api_key=${process.env.API_KEY_SECRET}`,
    httpMethod: "POST",
    body: {
      url,
      resize_config: resizeConfig,
    } as any,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const fileService = {
  fetch,
  save,
  remove,
  resizeImg,
};

export default fileService;
