import {
  ListFriendsResponse,
  UpdateUserRequest,
  User,
  UserResponse,
  UserToken,
} from "../types";
import { getTimestamps } from "../utils/date";
import { getMongoId, getMongoIdOrFail, isEqual } from "../utils/mongo";
import db from "./db";

const collection = db.collection("user");

/**
 * Get all users for current user
 */
async function getUsers() {
  // TODO: One day we want to make things secure and restrict it to users in shared events
  return collection.find({}).toArray() as unknown as UserResponse[];
}

async function listFriends(userId: string) {
  const users = await getUsers();
  const user = await getUser(userId);
  const yourFriends = users.filter((u) =>
    user.friends.some((friendId) => isEqual(u._id, friendId))
  );
  const addedYou = users.filter((u) =>
    u.friends.some((otherUserFriendId) => isEqual(userId, otherUserFriendId))
  );

  return {
    yourFriends,
    addedYou,
  } as unknown as Promise<ListFriendsResponse>;
}

async function createUser(user: UserToken) {
  const userToCreate: User = {
    name: user.name ?? "unknown",
    sub: user.sub,
    email: user.email ?? "",
    photo: user.photo ?? "",
    friends: [],
    ...getTimestamps(),
  };
  const result = await collection.insertOne(userToCreate);

  return getUser(result.insertedId.toString());
}

async function updateUser(id: string, user: UpdateUserRequest) {
  await collection.updateOne(
    {
      _id: getMongoIdOrFail(id),
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
    _id: getMongoId(id),
  })) as unknown as UserResponse;

  return user;
}

async function updatePhoto(id: string, photo: string) {
  await collection.updateOne(
    { _id: getMongoIdOrFail(id) },
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
      _id: getMongoIdOrFail(id),
    },
    {
      $set: {
        sub: user.sub + "-deleted",
        status: "deleted", // TODO #37 - Revert
      },
    }
  );
}

async function addFriend(friendId: string, userId: string) {
  const user = await getUser(userId);

  // Don't add the same friend twice
  if (user.friends.some((id) => isEqual(id, friendId))) {
    return user;
  }

  await collection.updateOne(
    {
      _id: getMongoIdOrFail(userId),
    },
    {
      $push: {
        friends: getMongoIdOrFail(friendId) as any,
      },
      $set: {
        updated_at: new Date().toISOString(),
      },
    }
  );

  return getUser(userId);
}

async function listAll() {
  const cursor = await collection.find({});
  return cursor.toArray() as unknown as UserResponse[];
}

export default {
  getUser,
  getUsers,
  listFriends,
  createUser,
  getUserBySub,
  updatePhoto,
  updateUser,
  deleteUser,
  addFriend,
  listAll,
};
