import { z } from "zod";

const login = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const forgotPass = z.object({
  email: z.string().email(),
});

const resendVerification = z.object({
  email: z.string().email(),
  emailType: z.string(),
});

const resetPass = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  password: z.string().min(6),
});

const changePass = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const refreshToken = z.object({
  token: z.string(),
});

const authValidations = {
  login,
  forgotPass,
  resetPass,
  changePass,
  resendVerification,
  refreshToken,
};

export default authValidations;
