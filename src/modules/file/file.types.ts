import { Prisma } from "@prisma/client";

export type Resizeconfig = {
  model: Prisma.ModelName;
  record_id: string;
  img_field: string;
  sizes: string;
};
