import { Role } from "#/src/lib/utils/roles";
import { SanitizedUser, UserCreate } from "#/src/modules/user/user.types";

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
};

export type AuthLogin = {
  email: string;
  password: string;
};

export type AuthSignup = Omit<UserCreate, "role"> & { password: string };

export type AuthVerifyEmail = {
  otp: string;
  email: string;
};

export type AuthForgotPass = {
  email: string;
  hcaptcha_token?: string;
};

export type AuthResetPass = {
  email: string;
  otp: string;
  password: string;
};

export type AuthChangePass = {
  oldPassword: string;
  newPassword: string;
};

export type AuthLoginResponse = {
  user: SanitizedUser;
  accessToken: string;
  refreshToken: string;
};
