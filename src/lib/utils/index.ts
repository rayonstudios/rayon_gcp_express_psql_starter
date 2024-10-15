import * as crypto from "crypto";
import { APIResponse } from "../types/misc";

export const isDevEnv = () => {
  return process.env.NODE_ENV === "dev";
};

export const isAppEngine = () => {
  return process.env.GAE_ENV === "standard";
};

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
