import { ObjectId, PushOperator } from "mongodb";
import db from "./db";
import {
  Expense,
  Message,
  Event,
  CreateEventRequest,
  CreateMessageRequest,
  CreateExpenseRequest,
} from "./types";

const collection = db.collection("event");

function getEvent(id: string) {
  return collection.findOne({ _id: new ObjectId(id) });
}

async function createEvent(event: CreateEventRequest) {
  const save: Event = {
    ...event,
    created_by: "66090d5f46d2f469069082eb", // TODO: get from authentication context
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    messages: [],
    participants: [],
    expenses: [],
  };
  const { insertedId } = await collection.insertOne(save);
  return getEvent(insertedId.toString());
}

function addMessage(id: string, message: CreateMessageRequest) {
  const save: Message = {
    created_by: "66090d5f46d2f469069082eb", // TODO: get from authentication context
    ...message,
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
  return updateList(id, {
    messages: save,
  });
}

function addExpense(id: string, expense: CreateExpenseRequest) {
  const save: Expense = {
    ...expense,
    created_by: "66090d5f46d2f469069082eb", // TODO: get from authentication context
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
  return updateList(id, {
    expenses: save,
  });
}

function addParticipant(id: string, participant: string) {
  return updateList(id, { participants: participant });
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
  addParticipant,
};
