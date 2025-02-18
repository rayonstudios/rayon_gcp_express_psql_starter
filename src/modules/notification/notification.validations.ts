import { z } from "zod";
import { NotificationUser } from "./notification.types";

const general = z.object({
  title: z.string(),
  message: z.string(),
  users: z.nativeEnum(NotificationUser),
  url: z.string().optional(),
  link: z.string().optional(),
});

const NotificationValidations = {
  general,
};

export default NotificationValidations;
