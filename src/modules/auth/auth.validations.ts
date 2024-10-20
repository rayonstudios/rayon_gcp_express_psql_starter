import { z } from "zod";

const login = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const forgotPass = z.object({
  email: z.string().email(),
});
const authValidations = {
  login,
  forgotPass,
};

export default authValidations;
