import { Prisma } from "@prisma/client";
import { IMAGE_SIZES } from "./file.helpers";

export type Resizeconfig = {
  model: Prisma.ModelName;
  record_id: string;
  img_field: string;
  sizes: (keyof typeof IMAGE_SIZES)[];
};

export type FileWithImgVariants = {
  url: string;
  img_sizes?: Record<string, string>;
};

// endpoint request types
export type FileDelete = {
  url: string;
};

export type FileWebhookHandleResize = {
  url: string;
  resize_config: Resizeconfig;
};
