import db from "./db";

const collection = db.collection("user");

export function createUser(user: User) {
  collection.insertOne(user);
}
