import { UpdateUserRequest, UserResponse } from "../types";
import { getTimestamps } from "../utils/date";
import { getMongoID } from "../utils/mongo";
import db from "./db";

const collection = db.collection("user");

/**
 * Get all users for current user
 */
async function getUsers() {
  // TODO: One day we want to make things secure and restrict it to users in shared events
  return collection.find({}).toArray();
}

async function createUser(sub: string, email: string) {
  const result = await collection.insertOne({
    name: "unknown",
    sub,
    email,
    ...getTimestamps(),
  });

  return getUser(result.insertedId.toString());
}

async function updateUser(id: string, user: UpdateUserRequest) {
  await collection.updateOne(
    {
      _id: getMongoID(id),
    },
    {
      $set: {
        ...user,
        updated_at: new Date().toISOString(),
      },
    }
  );

  return getUser(id);
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
  getUsers,
  createUser,
  getUserBySub,
  updatePhoto,
  updateUser,
};
