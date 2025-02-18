import { UserMutable } from "../user/user.types";

export type ProfileUpdate = Partial<
  Omit<UserMutable, "email" | "fcm_tokens"> & {
    added_fcm_token: string;
    removed_fcm_token: string;
  }
>;
