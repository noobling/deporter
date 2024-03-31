import { ObjectId, PushOperator } from "mongodb";
import db from "./db";
import { Expense, Message, Event, CreateEventRequest } from "./types";

const collection = db.collection("event");

function getEvent(id: string) {
  return collection.findOne({ _id: new ObjectId(id) });
}

function createEvent(event: CreateEventRequest) {
  return collection.insertOne({
    ...event,
    created_by: "66090d5f46d2f469069082eb", // TODO: get from authentication context
    created_at: Date(),
    updated_at: Date(),
  });
}

function addMessage(id: string, message: Message) {
  updateList(id, { messages: { $each: [message], $sort: -1 } });
}

function addExpense(id: string, expense: Expense) {
  updateList(id, { expenses: expense });
}

function addParticipant(id: string, participant: string) {
  updateList(id, { participants: participant });
}

function updateList(id: string, push: PushOperator<Document>) {
  return collection.updateOne(
    { _id: new ObjectId(id) },
    {
      $push: push,
      $set: {
        updated_at: Date(),
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
