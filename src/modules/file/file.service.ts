import * as admin from "firebase-admin";

admin.initializeApp({
  storageBucket: process.env.STORAGE_BUCKET,
});

type File = Express.Multer.File & { createdBy?: string };

const pathFromUrl = (url: string) => {
  const urlObj = new URL(url);
  return decodeURIComponent(urlObj.pathname).split("/").at(-1)!;
};

const _save = async (file: File, overwrite: boolean) => {
  const bucket = admin.storage().bucket();
  const existing = overwrite
    ? [false]
    : await bucket.file(file.originalname).exists();

  const uploadedFile = await bucket.upload(file.path, {
    destination: existing[0] ? `${file.originalname} copy` : file.originalname,
    metadata: {
      contentType: file.mimetype,
      metadata: {
        createdBy: file.createdBy ?? "server",
      },
    },
  });

  const [url] = await uploadedFile[0].getSignedUrl({
    action: "read",
    expires: "03-09-2491",
  });

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
  const bucket = admin.storage().bucket();
  const filePath = pathFromUrl(fileUrl);

  await bucket.file(filePath).delete();
};

const fileService = {
  fetch,
  save,
  remove,
};

export default fileService;
