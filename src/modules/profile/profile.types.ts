import { UserUpdate } from "../user/user.types";

export type ProfileUpdate = Partial<
  Omit<UserUpdate, "role"> & {
    added_fcm_token: string;
    removed_fcm_token: string;
  }
>;
