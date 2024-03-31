import db from "./db";
import { User } from "./types";

const collection = db.collection("user");

export function createUser(user: User) {
  collection.insertOne(user);
}
