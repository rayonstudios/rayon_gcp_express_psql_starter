import { z } from "zod";

const create = z.object({
  email: z.string().email(),
});

const userValidations = {
  create,
};

export default userValidations;
