import { firebase } from "#/src/lib/firebase/firebase.service";
import { pathFromUrl } from "#/src/lib/utils/file.utils";
import { prisma } from "#/src/lib/utils/prisma";
import { bgJobsService } from "../bg-jobs/bg-jobs.service";
import { BgJobType } from "../bg-jobs/bg-jobs.types";
import { getResizedImages, uploadFile } from "./file.helpers";
import { FileResizeImgInput, FileUpload, Resizeconfig } from "./file.types";

const fetch = async (fileUrl: string) => {
  const filePath = pathFromUrl(fileUrl);

  const [file] = await firebase.bucket.file(filePath).get();
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

  await firebase.bucket.file(filePath).delete();
};

const triggerResizeImg = async (url: string, resizeConfig: Resizeconfig) => {
  await bgJobsService.create({
    job: BgJobType.RESIZE_IMAGE,
    payload: {
      url,
      resize_config: resizeConfig,
    },
  });
};

const resizeImg = async (payload: FileResizeImgInput) => {
  const urlsMap = await getResizedImages(
    payload.url,
    payload.resize_config.sizes,
    `${payload.resize_config.model}_${payload.resize_config.record_id}_${payload.resize_config.img_field}.jpg`
  );

  // Update the database record with the resized image URLs
  const updates = {
    [`${payload.resize_config.img_field}_sizes`]: urlsMap,
  };
  await (prisma[payload.resize_config.model] as any).update({
    where: { id: payload.resize_config.record_id },
    data: updates,
  });

  return { urlsMap };
};

const fileService = {
  fetch,
  save,
  remove,
  resizeImg,
  triggerResizeImg,
};

export default fileService;
