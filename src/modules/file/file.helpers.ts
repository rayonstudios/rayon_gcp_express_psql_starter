import { firebase } from "#/src/lib/firebase/firebase.service";
import { GenericObject } from "#/src/lib/types/utils";
import { reduceToArea } from "#/src/lib/utils";
import {
  extractFileName,
  isImageUrl,
  isStorageUrl,
} from "#/src/lib/utils/file.utils";
import { UploadResponse } from "@google-cloud/storage";
import axios from "axios";
import fs from "fs";
import { uniq } from "lodash";
import os from "os";
import path from "path";
import sharp from "sharp";
import fileService from "./file.service";
import { FileUpload, Resizeconfig } from "./file.types";

export const IMAGE_SIZES = {
  small: 125 * 125,
  medium: 300 * 300,
  large: 500 * 500,
};

export async function getResizedImages(
  url: string,
  sizes: Resizeconfig["sizes"],
  fallbackName?: string
) {
  const availableSizes = uniq(sizes);
  const defaultUrlsMap = availableSizes.reduce(
    (acc, size) => ({ ...acc, [size]: url }),
    {}
  );

  if (!isImageUrl(url) || !availableSizes.length) return defaultUrlsMap;

  //download the source file.
  const imageName = extractFileName(url) ?? fallbackName;
  const imagePath = path.join(os.tmpdir(), `${Date.now()}_${imageName}`);
  const response = await axios({ url, responseType: "arraybuffer" });
  const buffer = response.data;
  await fs.promises.writeFile(imagePath, Buffer.from(buffer));

  // extract metadata from the source file
  let metadata: GenericObject = {};
  if (isStorageUrl(url)) {
    const file = await fileService.fetch(url);
    metadata = file.metadata.metadata ?? {};
  }

  //getting source file width and heigth through sharp
  const source = sharp(imagePath);
  const { width = 0, height = 0 } = await source.metadata();
  const imageArea = width * height;
  const uploadPromises: Promise<Record<string, string>>[] = [];

  for (const size of availableSizes) {
    const resizedArea = IMAGE_SIZES[size];
    if (!resizedArea) continue;

    // if the image is already smaller than the resized area, skip resizing
    if (imageArea <= resizedArea) {
      uploadPromises.push(Promise.resolve({ size, url }));
      continue;
    }

    // calculate new dimensions for the resized image
    const newDims = reduceToArea({ width, height, area: resizedArea });
    const newName = `${size}_${imageName}`;
    const resizedImgPath = path.join(os.tmpdir(), newName);

    const uploadPromise = (async () => {
      //resize image
      await sharp(imagePath)
        .resize(newDims.width, newDims.height)
        .toFile(resizedImgPath);

      //upload resized image
      const uploadedFile = await firebase.bucket.upload(resizedImgPath, {
        destination: newName,
        metadata: {
          metadata,
        },
      });
      const url = await getDownloadUrl(uploadedFile);

      return { size, url };
    })();
    uploadPromises.push(uploadPromise);
  }

  const urls = await Promise.all(uploadPromises);
  const urlsMap = urls.reduce((acc, { size, url }) => {
    acc[size] = url;
    return acc;
  }, {});

  //cleanup
  fs.rmSync(imagePath, { force: true, recursive: true });

  return urlsMap;
}

export const getDownloadUrl = async (res: UploadResponse) => {
  const [url] = await res[0].getSignedUrl({
    action: "read",
    expires: "03-09-2491",
  });

  return url;
};

export const renameDuplicateFile = (name: string) => {
  const hasExtension = name.includes(".");
  const fileName = hasExtension ? name.split(".").slice(0, -1).join(".") : name;
  const fileExtension = hasExtension ? name.split(".").pop() : "";
  return `${fileName}-copy-${Date.now()}${fileExtension ? `.${fileExtension}` : ""}`;
};

export const uploadFile = async (file: FileUpload, overwrite: boolean) => {
  const metadata: Record<string, string> = {};
  if (file.createdBy) metadata.createdBy = file.createdBy;

  const existing = overwrite
    ? [false]
    : await firebase.bucket.file(file.originalname).exists();

  const uploadedFile = await firebase.bucket.upload(file.path, {
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
    await fileService.triggerResizeImg(url, file.resizeConfig);
  }

  return url;
};
