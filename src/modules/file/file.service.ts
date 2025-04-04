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

const renameDuplicateFile = (name: string) => {
  const hasExtension = name.includes(".");
  const fileName = hasExtension ? name.split(".").slice(0, -1).join(".") : name;
  const fileExtension = hasExtension ? name.split(".").pop() : "";
  return `${fileName}-copy-${Date.now()}${fileExtension ? `.${fileExtension}` : ""}`;
};

const _save = async (file: File, overwrite: boolean) => {
  const metadata: Record<string, string> = {};
  if (file.createdBy) metadata.createdBy = file.createdBy;

  const existing = overwrite
    ? [false]
    : await bucket.file(file.originalname).exists();

  const uploadedFile = await bucket.upload(file.path, {
    destination: existing[0]
      ? renameDuplicateFile(file.originalname)
      : file.originalname,
    metadata: {
      contentType: file.mimetype,
      metadata,
    },
  });

  const url = await getDownloadUrl(uploadedFile);
  if (file.resizeConfig) {
    await resizeImg(url, file.resizeConfig);
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
