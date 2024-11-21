import { Role } from "#/src/lib/utils/roles";
import { z } from "zod";

const create = z.object({
  email: z.string().email(),
  role: z.nativeEnum(Role).optional(),
});

const userValidations = {
  create,
};

export default userValidations;
