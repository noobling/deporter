import { ObjectId, PushOperator } from "mongodb";
import {
  AddParticipantRequest,
  Event,
  EventResponse,
  Expense,
  Message,
  Payment,
} from "../types";
import { getMongoID } from "../utils/mongo";
import db from "./db";

const collection = db.collection("event");

async function listEvents() {
  // TODO: change this when we make private events
  const cursor = await collection.find({});
  return cursor.toArray() as unknown as EventResponse[];
}

async function getEventsToJoin(currentUserId: string) {
  const cursor = await collection.find({
    participants: { $nin: [currentUserId] },
  });
  const result = (await cursor.toArray()) as unknown as EventResponse[];
  return result;
}

function getEvent(id: string) {
  return collection.findOne({ _id: getMongoID(id) });
}

async function createEvent(event: Event) {
  const { insertedId } = await collection.insertOne(event);
  return getEvent(insertedId.toString());
}

async function addMessage(id: string, message: Message) {
  await updateList(id, {
    messages: message,
  });
  return getEvent(id);
}

async function addExpense(id: string, expense: Expense) {
  await updateList(id, {
    expenses: expense,
  });

  return getEvent(id);
}

async function addPayment(id: string, payment: Payment) {
  await updateList(id, {
    payments: payment,
  });

  return getEvent(id);
}

function addParticipants(id: string, participants: AddParticipantRequest) {
  return updateList(id, { participants: { $each: participants.participants } });
}

function updateList(id: string, push: PushOperator<Document>) {
  return collection.updateOne(
    { _id: getMongoID(id) },
    {
      $push: push,
      $set: {
        updated_at: new Date().toISOString(),
      },
    }
  );
}

export default {
  listEvents,
  getEvent,
  createEvent,
  addMessage,
  addExpense,
  addParticipants,
  addPayment,
  getEventsToJoin,
};
