import { ObjectId, PushOperator } from "mongodb";
import {
  AddParticipantRequest,
  CreateExpenseRequest,
  Event,
  Expense,
  Message,
} from "../types";
import db from "./db";

const collection = db.collection("event");

function getEvent(id: string) {
  return collection.findOne({ _id: new ObjectId(id) });
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

function addParticipants(id: string, participants: AddParticipantRequest) {
  return updateList(id, { participants: { $each: participants.participants } });
}

function updateList(id: string, push: PushOperator<Document>) {
  return collection.updateOne(
    { _id: new ObjectId(id) },
    {
      $push: push,
      $set: {
        updated_at: new Date().toISOString(),
      },
    }
  );
}

export default {
  getEvent,
  createEvent,
  addMessage,
  addExpense,
  addParticipants,
};
