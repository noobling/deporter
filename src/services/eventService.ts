import {
  AuthContext,
  CreateEventRequest,
  CreateMessageRequest,
  CreatePaymentRequest,
  EventResponse,
  EventsResponse,
  Expense,
  Message,
  UpdateEventRequest,
} from "../types";
import events from "../db/events";
import { getDaysToGo, getTimestamps } from "../utils/date";
import {
  sendPushNotification,
  sendWebsocketNotification,
  WebsocketEventType,
} from "./notificationService";
import { adminSendMessage } from "../utils/admin";

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
    ...payload,
    created_by: context.authedUser._id,
    messages: [],
    participants: [context.authedUser._id],
    expenses: [],
    payments: [],
    status: "private",
    ...getTimestamps(),
  });
}

export async function updateEvent(
  payload: UpdateEventRequest,
  context: AuthContext
) {
  return events.updateEvent(context.id, payload);
}

export async function addEventExpense(payload: any, context: AuthContext) {
  const expense: Expense = {
    ...payload,
    created_by: context.authedUser._id,
    ...getTimestamps(),
  };
  return events.addExpense(context.id!!, expense);
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
  };

  const { data, user } = await events.addMessage(context.id!!, message);
  if (data) {
    const participants = data.participants.filter(
      (p) => p !== message.created_by
    );
    const photoCount = message.media.length;
    const description =
      photoCount > 0 ? `Sent ${photoCount} photo(s)` : message.content;
    const url = `/event/chat?id=${data._id}`;
    for (const userId of participants) {
      sendPushNotification(userId, {
        type: WebsocketEventType.ROUTING_PUSH_NOTIFICATION,
        payload: {
          goTo: url,
          title: `${user.name} (${data.name})`,
          description,
        },
      });
      sendWebsocketNotification(userId, {
        type: WebsocketEventType.MESSAGE_NOTIFICATION,
        payload: {
          eventId: data._id.toString(),
        },
      });
    }
  }
  return data;
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
  } else if (event.participants.includes(context.authedUser._id)) {
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
  const TEMP_HARD_CODED_EVENTS_TO_REMIND: string[] = [];
  const promises = Promise.all(
    TEMP_HARD_CODED_EVENTS_TO_REMIND.flatMap(async (id) => {
      const result = await events.getEvent(id);
      if (!result) return [];
      if (getDaysToGo(result?.start_time) > 0) {
        return [result];
      } else {
        [];
      }
    })
  );
  return promises as unknown as Promise<EventResponse[]>;
}
