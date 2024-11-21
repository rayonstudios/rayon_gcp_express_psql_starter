import { Request as ExReq, Response as ExRes } from "express";

export interface APIResponse<T = null> {
  data: T | null;
  error: string | null;
}

export type PrismaEntityMutable<T> = Omit<
  T,
  "id" | "created_at" | "updated_at"
>;

export type Message = {
  message: string;
};

export { ExReq, ExRes };
