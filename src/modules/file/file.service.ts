import cloudTaskService from "#/src/lib/cloud-task/cloud-task.service";
import { BE_URL } from "#/src/lib/constants";
import * as admin from "firebase-admin";
import { getDownloadUrl, pathFromUrl } from "./file.helpers";
import { Resizeconfig } from "./file.types";

admin.initializeApp({
  storageBucket: process.env.STORAGE_BUCKET,
});
export const bucket = admin.storage().bucket();

type File = Express.Multer.File & {
  createdBy?: string;
  resizeConfig?: Resizeconfig;
};

const _save = async (file: File, overwrite: boolean) => {
  const metadata: Record<string, string> = {};
  if (file.createdBy) metadata.createdBy = file.createdBy;
  if (file.resizeConfig) {
    Object.entries(file.resizeConfig).forEach(([key, value]) => {
      metadata[key] = value;
    });
  }

  const existing = overwrite
    ? [false]
    : await bucket.file(file.originalname).exists();

  const uploadedFile = await bucket.upload(file.path, {
    destination: existing[0] ? `${file.originalname} copy` : file.originalname,
    metadata: {
      contentType: file.mimetype,
      metadata,
    },
  });

  const url = await getDownloadUrl(uploadedFile);
  if (file.resizeConfig) {
    await cloudTaskService.add({
      queuePath: process.env.GENERAL_TASKS_QUEUE!,
      runsAt: new Date(), // Run immediately
      url: `${BE_URL}/files/webhooks/handle-img-resize?api_key=${process.env.API_KEY_SECRET}`,
      httpMethod: "POST",
      body: {
        url,
        resize_config: file.resizeConfig,
      } as any,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return url;
};

const fetch = async (fileUrl: string) => {
  const bucket = admin.storage().bucket();
  const filePath = pathFromUrl(fileUrl);

  const [file] = await bucket.file(filePath).get();
  return file;
};

const save = async (files: File[], overwrite = false) => {
  const urls = await Promise.all(files.map((file) => _save(file, overwrite)));
  return urls;
};

const remove = async (fileUrl: string) => {
  const filePath = pathFromUrl(fileUrl);

  await bucket.file(filePath).delete();
};

const fileService = {
  fetch,
  save,
  remove,
};

export default fileService;
