import { UpdateUserRequest, UserResponse, UserToken } from "../types";
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

async function createUser(user: UserToken) {
  const result = await collection.insertOne({
    name: user.name ?? "unknown",
    sub: user.sub,
    email: user.email,
    photo: user.photo,
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
  return collection.findOne({ sub }) as unknown as UserResponse | undefined;
}

async function getUser(id: string): Promise<UserResponse> {
  const user = (await collection.findOne({
    _id: getMongoID(id),
  })) as unknown as UserResponse;

  if ('status' in user && user.status === "deleted") {
    return {
      sub: '',
      _id: user._id,
      name: 'deleted user',
      photo: '',
      created_at: user.created_at,
      updated_at: user.updated_at,
    }
  }
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

async function deleteUser(id: string) {
  const user = await getUser(id);
  return collection.updateOne(
    {
      _id: getMongoID(id),
    },
    {
      $set: {
        sub: user.sub + "-deleted",
        status: "deleted",
      },
    }
  );
}

export default {
  getUser,
  getUsers,
  createUser,
  getUserBySub,
  updatePhoto,
  updateUser,
  deleteUser,
};
