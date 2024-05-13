import { Message } from "../types";

export function messageIsPhoto(message?: Message) {
  if (!message) {
    return false;
  }

  if (message.media && message.media.length > 0) {
    return true;
  }

  return false;
}
