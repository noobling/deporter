import { ObjectId } from "mongodb";
import db from "./db";
import { User, UserResponse } from "../types";
import { getMongoID } from "../utils/mongo";
import { getTimestamps } from "../utils/date";

const collection = db.collection("user");

async function createUser(user: User) {
  const result = await collection.insertOne({
    ...user,
    ...getTimestamps(),
  });

  return getUser(result.insertedId.toString());
}

function getUserBySub(sub: string) {
  return collection.findOne({ sub });
}

async function getUser(id: string): Promise<UserResponse> {
  const user = (await collection.findOne({
    _id: getMongoID(id),
  })) as unknown as UserResponse;
  return user;
}

async function updatePhoto(id: string, photo: string) {
  await collection.updateOne(
    { _id: getMongoID(id) },
    {
      $set: {
        photo,
        updated_at: new Date().toISOString(),
      },
    }
  );

  return getUser(id);
}

export default {
  getUser,
  createUser,
  getUserBySub,
  updatePhoto,
};
