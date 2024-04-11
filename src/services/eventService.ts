import {
  AuthContext,
  CreateEventRequest,
  CreateMessageRequest,
  CreatePaymentRequest,
  EventsResponse,
  Expense,
  Message,
} from "../types";
import events from "../db/events";
import { getTimestamps } from "../utils/date";

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
    ...getTimestamps(),
  });
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
  return events.addMessage(context.id!!, message);
}

export async function addEventParticipants(payload: any, context: AuthContext) {
  await events.addParticipants(context.id, payload);
  return events.getEvent(context.id);
}

export async function joinEvent(_: any, context: AuthContext) {
  await events.addParticipants(context.id, {
    participants: [context.authedUser._id],
  });
  return events.getEvent(context.id);
}

export async function getEventsToJoin(_: any, context: AuthContext) {
  return events.getEventsToJoin(context.authedUser._id);
}
