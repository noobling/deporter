import { ObjectId } from "mongodb";
import db from "./db";
import { User, UserResponse } from "../types";

const collection = db.collection("user");

async function createUser(user: User) {
  const result = await collection.insertOne({
    ...user,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  return getUser(result.insertedId.toString());
}

function getUserBySub(sub: string) {
  return collection.findOne({ sub });
}

async function getUser(id: string): Promise<UserResponse> {
  const user = (await collection.findOne({
    _id: new ObjectId(id),
  })) as unknown as UserResponse;
  return user;
}

export default {
  getUser,
  createUser,
  getUserBySub,
};
