import { Prisma } from "@prisma/client";
import { IMAGE_SIZES } from "./file.helpers";

export type IMAGE_SIZE = keyof typeof IMAGE_SIZES;

export type Resizeconfig = {
  model: Prisma.ModelName;
  record_id: string;
  img_field: string;
  sizes: IMAGE_SIZE[];
};

export type FileWithImgVariants = {
  url: string;
  img_sizes?: Record<string, string>;
};

export type FileUpload = Express.Multer.File & {
  createdBy?: string;
  resizeConfig?: Resizeconfig;
};

// endpoint request types
export type FileDelete = {
  url: string;
};

export type FileResizeImgInput = {
  url: string;
  resize_config: Resizeconfig;
};
