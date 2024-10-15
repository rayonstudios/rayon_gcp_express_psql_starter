import { z } from "zod";

const login = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const authValidations = {
  login,
};

export default authValidations;
