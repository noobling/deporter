import { ObjectId } from "mongodb";
import db from "./db";
import { User } from "../types";

const collection = db.collection("user");

async function createUser(user: User) {
  const result = await collection.insertOne({
    ...user,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  return getUser(result.insertedId.toString());
}

function getUser(id: string) {
  return collection.findOne({ _id: new ObjectId(id) });
}

export default {
  createUser,
  getUser,
};
