import { z } from "zod";

const login = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const forgotPass = z.object({
  email: z.string().email(),
});

const resetPass = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  password: z.string().min(6),
});

const changePass = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

const authValidations = {
  login,
  forgotPass,
  resetPass,
  changePass,
};

export default authValidations;
