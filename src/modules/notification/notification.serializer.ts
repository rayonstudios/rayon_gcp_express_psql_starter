import { getSerializers } from "#/src/lib/utils/serializer";
import { Notification } from "./notification.types";

const { paginated } = getSerializers(
  (notification: Notification) => notification
);

const NotificationSerializer = {
  paginated,
};

export default NotificationSerializer;
