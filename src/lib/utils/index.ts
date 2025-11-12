import * as crypto from "crypto";
import { APIResponse } from "../types/misc";
import { GenericObject } from "../types/utils";

export const isDevEnv = () => {
  return process.env.NODE_ENV === "dev";
};

export const isTestEnv = () => {
  return process.env.NODE_ENV === "test";
};

export const isProdEnv = () => {
  return process.env.NODE_ENV === "production";
};

export function isCloudRun() {
  return process.env.K_SERVICE && process.env.K_REVISION;
}

export const toResponse = <T>({
  data,
  error,
}: {
  data?: T;
  error?: string;
}): APIResponse<T> => {
  return {
    data: data || null,
    error: error || null,
  };
};

export const randomString = (len: number) => {
  return Buffer.from(crypto.randomBytes(len))
    .toString("base64")
    .replace(/[+/]/g, "")
    .substring(0, len);
};

export const isImage = (type: string) => {
  return type.startsWith("image");
};

export const slugify = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

export const getIp = (req: GenericObject) => {
  const ip =
    req.clientIp ||
    req.ip ||
    req.headers["x-forwarded-for"]?.split(",").pop() ||
    req.socket?.remoteAddress;

  const prefix = "::ffff:";
  if (ip?.startsWith(prefix)) return ip.slice(prefix.length);
};

export const reduceToArea = ({
  width,
  height,
  area,
}: {
  width: number;
  height: number;
  area: number;
}) => {
  const imageArea = width * height;
  const ratio = Math.sqrt(imageArea / area);

  const shouldTransform = imageArea > area;

  return {
    width: shouldTransform ? Math.round(width / ratio) : width,
    height: shouldTransform ? Math.round(height / ratio) : height,
  };
};
