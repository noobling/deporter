import { MongoClient } from "mongodb";
import db from "../db/db";

async function addFriendsArrayToUsers() {
  const collection = db.collection("user");

  const result = await collection.updateMany(
    {},
    {
      $set: {
        friends: [],
      },
    }
  );
  console.log("Updated", result.modifiedCount, "users");
  return result;
}

addFriendsArrayToUsers();
