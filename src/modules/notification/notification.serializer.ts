import { getSerializers } from "#/src/lib/utils/serializer";
import { omit } from "lodash";
import { UserNotification } from "./notification.types";

const { paginated } = getSerializers((userNotification: UserNotification) => ({
  ...omit<UserNotification>(userNotification, [
    "id",
    "user_id",
    "notification_id",
    "notification",
  ]),
  ...userNotification.notification,
}));

const notificationSerializer = {
  paginated,
};

export default notificationSerializer;
