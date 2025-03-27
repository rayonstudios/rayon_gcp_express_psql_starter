import { getSerializers } from "#/src/lib/utils/serializer";
import { UserNotification } from "./notification.types";

const { paginated } = getSerializers(
  (notification: UserNotification) => notification
);

const notificationSerializer = {
  paginated,
};

export default notificationSerializer;
