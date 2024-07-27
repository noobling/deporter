import {
  Context,
  CreateEventRequest,
  CreateExpenseAdjustmentRequest,
  CreateExpenseRequest,
  CreateMessageReactionRequest,
  CreateMessageReadReceiptRequest,
  CreateMessageRequest,
  CreatePaymentRequest,
  DeleteExpenseRequest,
  EventResponse,
  EventsResponse,
  Expense,
  Message,
  PinMessageRequest,
  PlanModel,
  UpdateEventRequest,
  UserResponse,
} from "../types";
import events, { addMessageReadReceipt } from "../db/events";
import expenseRepository from "../db/expense";
import { getDaysToGo, getTimestamps } from "../utils/date";
import {
  cacheNotificationToProcess,
  WebsocketEventType,
} from "./notificationService";
import { adminSendMessage } from "../utils/admin";
import { isEqual } from "../utils/mongo";
import media from "../db/media";
import { v4 as uuidv4 } from "uuid";
import { messageIsPhoto } from "../utils/message";
import plan from "../db/plan";
import { Currency } from "../types/moneyTransactionDto";

export async function getEvent(payload: any, context: Context) {
  return events.getEvent(context.id!!);
}

export async function getEventMetaData(payload: any, context: Context) {
  return events.getEventMetaData(context.id!!);
}

export async function getEventsForCurrentUser(
  payload: any,
  context: Context
): Promise<EventsResponse> {
  const data = await events.listEvents(context.authedUser._id);

  return { events: data };
}

export async function createEvent(
  payload: CreateEventRequest,
  context: Context
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
  context: Context
) {
  const result = await events.updateEvent(context.id, payload);
  adminSendMessage({
    message: `Event ${result!!.name} has been updated by ${context.authedUser.name
      }!`,
    eventId: result!!._id,
  });
  return result;
}

export async function addEventExpense(payload: any, context: Context) {
  const expense: Expense = {
    ...payload,
    payer: payload.payer ?? context.authedUser._id,
    created_by: context.authedUser._id,
    ...getTimestamps(),
  };

  if (expense.amount < 0) {
    if (expense.applicable_to.length > 1) {
      throw new Error("Negative expense can only be applicable to one person");
    }

    // TODO get rid of this
    const result = await events.addExpense(context.id!!, expense);

    expenseRepository.createMoneyTransaction({
      owed_to: payload.payer ?? context.authedUser._id,
      name: expense.name,
      currency: Currency.AUD,
      amount: expense.amount,
      media: expense.media,
      applicable_to: expense.applicable_to,
      context: {
        id: result!!._id,
        type: 'event',
      },
      type: "expense",
      adjustments: {},
    }, context.authedUser._id);

    adminSendMessage({
      message: `${context.authedUser.name} received a payment: ${expense.name
        } of $${-expense.amount} to ${result?.name}`,
      eventId: result!!._id,
      route_to: `/event/(expense)/receipt?id=${result?._id}`,
    });
    return result;
  }

  const result = await events.addExpense(context.id!!, expense);
  await adminSendMessage({
    message: `${context.authedUser.name} added ${expense.name} expense of $${expense.amount} to ${result?.name}`,
    eventId: result!!._id,
    route_to: `/event/(expense)/receipt?id=${result?._id}`,
  });
  return result;
}

export async function deleteExpense(
  payload: DeleteExpenseRequest,
  context: Context
) {
  await events.deleteExpense(context.id!!, payload.id);
  await adminSendMessage({
    message: `${context.authedUser.name} deleted ${payload.name} expense`,
    eventId: context.id,
  });
}

export async function createExpenseAdjustment(
  payload: CreateExpenseAdjustmentRequest,
  context: Context
) {
  await events.addExpenseAdjustment(
    context.id!!,
    payload.expense_id,
    context.authedUser._id,
    payload.value
  );
  await adminSendMessage({
    message: `${context.authedUser.name} updated ${payload.name} expense`,
    eventId: context.id,
  });
  return await events.getEvent(context.id);
}

export async function addEventPayment(
  payload: CreatePaymentRequest,
  context: Context
) {
  const event = await events.addPayment(context.id!!, {
    ...payload,
    created_by: context.authedUser._id,
    ...getTimestamps(),
  });

  if (event) {
    await adminSendMessage({
      message: `${context.authedUser.name} added a payment of $${payload.amount} to ${event.name}`,
      eventId: event._id,
      route_to: `/event/(expense)/view-expense?id=${event?._id}`,
    });
  }

  return event;
}

export async function addEventMessage(
  payload: CreateMessageRequest,
  context: Context
) {
  const message: Message = {
    created_by: context.authedUser._id,
    id: uuidv4(),
    ...payload,
    ...getTimestamps(),
    reactions: {},
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
  context: Context
) {
  const { data, sender } = await events.addMessageReaction(
    context.id!!,
    payload.message_id,
    context.authedUser._id,
    payload.reaction
  );
  if (!payload.reaction.startsWith("o:") && data && sender) {
    const goTo = `/event/chat?id=${data._id}&messageId=${payload.message_id}`;
    sendNotifsFromUserToUserAsync(
      payload.message_created_by,
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
  context: Context
) {
  return await addMessageReadReceipt(
    context.id!!,
    context.authedUser._id,
    payload.message_id
  );
}

export async function pinEventMessage(
  payload: PinMessageRequest,
  context: Context
) {
  await events.pinMessage(context.id!!, payload.message_id);
  const message = await events.getMessage(context.id!!, payload.message_id);
  await adminSendMessage({
    message: `${context.authedUser.name} pinned ${
      messageIsPhoto(message) ? "photo" : message?.content
    }`,
    eventId: context.id,
  });

  return message;
}

export async function addEventParticipants(payload: any, context: Context) {
  await events.addParticipants(context.id, payload);
  return events.getEvent(context.id);
}

export async function joinEvent(_: any, context: Context) {
  await events.addParticipants(context.id, {
    participants: [context.authedUser._id],
  });

  await adminSendMessage({
    message: `${context.authedUser.name} has joined the event!!`,
    eventId: context.id,
  });

  return events.getEvent(context.id);
}

export async function joinEventByCode(payload: any, context: Context) {
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

export async function getEventsToJoin(_: any, context: Context) {
  return events.getEventsToJoin(context.authedUser._id);
}

export async function sendEventReminder() {
  const eventsToRemind = await plan.listFuturePlansWithCountdown();
  for (const event of eventsToRemind) {
    const daysToGo = getDaysToGo(event.start_date_time);

    await adminSendMessage({
      message: getRandomMessage(daysToGo, event.note),
      eventId: event.event_id.toString(),
    });
  }
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

const messages = [
  "Time to stop, drop and snap 📸, ${daysToGo} days left 🎉",
  "Capture the moment! Only ${daysToGo} days to go 📸✨",
  "Don't miss out! ${daysToGo} days left to share your snaps 🎉📸",
  "Snap away! ${daysToGo} days remaining 📸🎊",
  "Celebrate with a photo! ${daysToGo} days left 📸🎉",
  "Your photo awaits! Just ${daysToGo} days left 📸🎈",
  "Get your cameras ready! ${daysToGo} days left 📸🥳",
  "Click, Share, Smile! Only ${daysToGo} days left 📸🎁",
  "You have been chosen by sepcial Jeremiah bot to snap a photo in ${daysToGo} days 📸🎉",
];

// Function to get a random message
function getRandomMessage(daysToGo: number, eventName: string) {
  const randomIndex = Math.floor(Math.random() * messages.length);
  const selectedMessage = messages[randomIndex] + ` for ${eventName}`;
  return selectedMessage.replace("${daysToGo}", daysToGo.toString());
}
