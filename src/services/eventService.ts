import {
  AuthContext,
  CreateEventRequest,
  CreateMessageRequest,
  Expense,
  Message,
} from "../types";
import events from "../db/events";

export async function getEvent(payload: any, context: AuthContext) {
  return events.getEvent(context.id!!);
}
export async function createEvent(
  payload: CreateEventRequest,
  context: AuthContext
) {
  return events.createEvent({
    ...payload,
    created_by: context.authedUser._id,
    messages: [],
    participants: [],
    expenses: [],
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

function getTimestamps() {
  return {
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
}
