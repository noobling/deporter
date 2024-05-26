import events from "../db/events";
import { AuthenticationError } from "../utils/handler";
import { isEqual } from "../utils/mongo";

export async function ensureUserInEvent(userId: string, eventId: string) {
  const found = await events.getEvent(eventId);
  if (!found) {
    throw new AuthenticationError("Event not found");
  }

  const userInEvent = found.participants.some((user) => isEqual(user, userId));
  const userIsOwner = isEqual(found.created_by, userId);

  if (!userInEvent && !userIsOwner) {
    throw new AuthenticationError("User not in event");
  }
}
