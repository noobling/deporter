import { ObjectId } from "mongodb";
import db from "./db";
import { User } from "./types";

const collection = db.collection("user");

function createUser(user: User) {
  return collection.insertOne({
    ...user,
    created_at: Date(),
    updated_at: Date(),
  });
}

function getUser(id: string) {
  return collection.findOne({ _id: new ObjectId(id) });
}

export default {
  createUser,
  getUser,
};
