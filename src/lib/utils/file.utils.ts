import { IMAGE_SIZE } from "#/src/modules/file/file.types";

export const sizedImg = <T>(obj: T, field: keyof T, size: IMAGE_SIZE) => {
  if (!obj) return "";

  return (obj as any)[`${field.toString()}_sizes`]?.[size] || obj[field];
};

export const pathFromUrl = (url: string) => {
  const urlObj = new URL(url);
  return decodeURIComponent(urlObj.pathname).split("/").at(-1)!;
};

export function isImageUrl(url: string): boolean {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
  return imageExtensions.some((ext) =>
    url
      .toLowerCase()
      .split(".")
      .some((part) => part.startsWith(ext))
  );
}

export function extractFileName(url: string): string {
  return decodeURIComponent(url.split("/").at(-1)?.split("?")?.[0] ?? "");
}

export const isStorageUrl = (url: string) => {
  return url.startsWith(
    `https://storage.googleapis.com/${process.env.STORAGE_BUCKET}`
  );
};
