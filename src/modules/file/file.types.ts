import { Prisma } from "@prisma/client";
import { IMAGE_SIZES } from "./file.helpers";

export type Resizeconfig = {
  model: Prisma.ModelName;
  record_id: string;
  img_field: string;
  sizes: (keyof typeof IMAGE_SIZES)[];
};
