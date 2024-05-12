import {
  AuthContext,
  CreateEventRequest,
  CreateMessageReactionRequest,
  CreateMessageReadReceiptRequest,
  CreateMessageRequest,
  CreatePaymentRequest,
  DeleteExpenseRequest,
  EventResponse,
  EventsResponse,
  Expense,
  Message,
  UpdateEventRequest,
  UserResponse,
} from "../types";
import events, { addMessageReadReceipt } from "../db/events";
import { getDaysToGo, getTimestamps } from "../utils/date";
import {
  cacheNotificationToProcess,
  WebsocketEventType,
} from "./notificationService";
import { adminSendMessage } from "../utils/admin";
import { isEqual } from "../utils/mongo";
import media from "../db/media";
import { v4 as uuidv4 } from "uuid";

export async function getEvent(payload: any, context: AuthContext) {
  return events.getEvent(context.id!!);
}

export async function getEventMetaData(payload: any, context: AuthContext) {
  return events.getEventMetaData(context.id!!);
}

export async function getEventsForCurrentUser(
  payload: any,
  context: AuthContext
): Promise<EventsResponse> {
  const data = await events.listEvents(context.authedUser._id);

  return { events: data };
}

export async function createEvent(
  payload: CreateEventRequest,
  context: AuthContext
) {
  return events.createEvent({
    // @ts-ignore - backwards compatibility
    status: "private",
    ...payload,
    created_by: context.authedUser._id,
    messages: [],
    participants: [context.authedUser._id],
    expenses: [],
    payments: [],
    ...getTimestamps(),
  });
}

export async function updateEvent(
  payload: UpdateEventRequest,
  context: AuthContext
) {
  const result = await events.updateEvent(context.id, payload);
  adminSendMessage({
    message: `Event ${result!!.name} has been updated by ${
      context.authedUser.name
    }!`,
    eventId: result!!._id,
  });
  return result;
}

export async function addEventExpense(payload: any, context: AuthContext) {
  const expense: Expense = {
    ...payload,
    created_by: context.authedUser._id,
    ...getTimestamps(),
  };

  if (expense.amount < 0) {
    if (expense.applicable_to.length > 1) {
      throw new Error("Negative expense can only be applicable to one person");
    }
    const result = await events.addExpense(context.id!!, expense);
    adminSendMessage({
      message: `${context.authedUser.name} received a payment: ${
        expense.name
      } of $${-expense.amount} to ${result?.name}`,
      eventId: result!!._id,
    });
    return result;
  }

  const result = await events.addExpense(context.id!!, expense);
  await adminSendMessage({
    message: `${context.authedUser.name} added ${expense.name} expense of $${expense.amount} to ${result?.name}`,
    eventId: result!!._id,
  });
  return result;
}

export async function deleteExpense(
  payload: DeleteExpenseRequest,
  context: AuthContext
) {
  await events.deleteExpense(context.id!!, payload.name);
  await adminSendMessage({
    message: `${context.authedUser.name} deleted ${payload.name} expense`,
    eventId: context.id,
  });
}

export async function addEventPayment(
  payload: CreatePaymentRequest,
  context: AuthContext
) {
  return events.addPayment(context.id!!, {
    ...payload,
    created_by: context.authedUser._id,
    ...getTimestamps(),
  });
}

export async function addEventMessage(
  payload: CreateMessageRequest,
  context: AuthContext
) {
  const message: Message = {
    created_by: context.authedUser._id,
    ...payload,
    ...getTimestamps(),
    reactions: {},
    id: uuidv4(),
  };

  const { data, user } = await events.addMessage(context.id!!, message);

  if (data) {
    await Promise.all(
      message.media.map((id) => media.addEventId(id, data?._id))
    );

    await sendNotifsForMessageInEventAsync(data, message, user);
  }
  return data;
}

export async function addEventMessageReaction(
  payload: CreateMessageReactionRequest,
  context: AuthContext
) {
  const { data, sender } = await events.addMessageReaction(
    context.id!!,
    payload.message_index,
    context.authedUser._id,
    payload.reaction
  );

  if (
    data &&
    sender &&
    sender._id !== data.messages[payload.message_index].created_by
  ) {
    const goTo = `/event/chat?id=${data._id}&messageId=${
      data.messages[payload.message_index].id
    }`;
    sendNotifsFromUserToUserAsync(
      data.messages[payload.message_index].created_by,
      "reacted to your message",
      goTo,
      sender,
      data._id
    );
  }

  return data;
}

export async function addEventMessageReadReceipt(
  payload: CreateMessageReadReceiptRequest,
  context: AuthContext
) {
  return await addMessageReadReceipt(
    context.id!!,
    context.authedUser._id,
    payload.message_id
  );
}

export async function addEventParticipants(payload: any, context: AuthContext) {
  await events.addParticipants(context.id, payload);
  return events.getEvent(context.id);
}

export async function joinEvent(_: any, context: AuthContext) {
  await events.addParticipants(context.id, {
    participants: [context.authedUser._id],
  });

  await adminSendMessage({
    message: `${context.authedUser.name} has joined the event!!`,
    eventId: context.id,
  });

  return events.getEvent(context.id);
}

export async function joinEventByCode(payload: any, context: AuthContext) {
  const code = context.queryParams.code;
  const event = await events.getByCode(code);
  if (!event) {
    return null;
  } else if (
    event.participants.some((p) => isEqual(p, context.authedUser._id))
  ) {
    return event;
  } else {
    await events.joinByCode(code, context.authedUser._id);
    await adminSendMessage({
      message: `${context.authedUser.name} has joined your private event!!`,
      eventId: event._id,
    });
    return events.getByCode(code);
  }
}

export async function getEventsToJoin(_: any, context: AuthContext) {
  return events.getEventsToJoin(context.authedUser._id);
}

export async function sendEventReminder() {
  const eventsToRemind = await getEventsToRemind();
  for (const event of eventsToRemind) {
    const daysToGo = getDaysToGo(event.start_time);

    await adminSendMessage({
      message: `Time to stop, drop and snap 📸, ${daysToGo} days left 🎉`,
      eventId: event._id,
    });
  }
}

export async function getEventsToRemind(): Promise<EventResponse[]> {
  // Hard coded for now since we have a lot of test events and no real users
  const TEMP_HARD_CODED_EVENTS_TO_REMIND: string[] = [
    "661f347eb00ae385b0528bc2",
  ];
  const items = TEMP_HARD_CODED_EVENTS_TO_REMIND.map(async (id) => {
    const result = await events.getEvent(id);
    if (!result) return null;
    if (getDaysToGo(result?.start_time) > 0) {
      return result;
    } else {
      null;
    }
  });
  const promises = await Promise.all(items);
  const filtered = promises.filter((p) => Boolean(p)) as EventResponse[];
  return filtered;
}

async function sendNotifsForMessageInEventAsync(
  event: EventResponse,
  message: Message,
  fromUser: UserResponse
) {
  const toSendUserIds = event.participants.filter(
    (p) => !isEqual(p, fromUser._id)
  );
  const goTo = `/event/chat?id=${event._id}`;
  console.log("Sending notifications to", toSendUserIds, "for", message);
  const promises = [];
  for (const userId of toSendUserIds) {
    promises.push(
      cacheNotificationToProcess(userId, {
        type: WebsocketEventType.ROUTING_PUSH_NOTIFICATION,
        payload: {
          goTo,
          title: `${fromUser.name} (${event.name})`,
          description: getMessageDescription(message),
        },
      })
    );
    promises.push(
      cacheNotificationToProcess(userId, {
        type: WebsocketEventType.MESSAGE_NOTIFICATION,
        payload: {
          eventId: event._id.toString(),
        },
      })
    );
  }

  return Promise.all(promises);
}

async function sendNotifsFromUserToUserAsync(
  toUser: string,
  message: string,
  goTo: string,
  fromUser: UserResponse,
  eventId?: string
) {
  console.log("Sending notifications to", toUser);
  const promises = [];
  for (const userId of [toUser]) {
    promises.push(
      cacheNotificationToProcess(userId, {
        type: WebsocketEventType.ROUTING_PUSH_NOTIFICATION,
        payload: {
          goTo,
          title: `${fromUser.name}`,
          description: message,
        },
      })
    );
    if (eventId) {
      promises.push(
        cacheNotificationToProcess(userId, {
          type: WebsocketEventType.MESSAGE_NOTIFICATION,
          payload: {
            eventId: eventId,
          },
        })
      );
    }
  }
  return Promise.all(promises);
}

function getMessageDescription(message: Message) {
  const photoCount = message.media.length;
  if (photoCount > 0) {
    return `Sent ${photoCount} photo(s)`;
  } else if (message.content.startsWith("U2FsdGVkX1")) {
    return "Sent a secret message";
  } else {
    return message.content;
  }
}
