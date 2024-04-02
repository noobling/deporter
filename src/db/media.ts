import { ObjectId } from "mongodb";
import { Media } from "../types";
import db from "./db";
import { getMongoID } from "../utils/mongo";

const collection = db.collection("media");

async function create(media: Media) {
  const { insertedId } = await collection.insertOne(media);
  return get(insertedId.toString());
}

async function get(id: string) {
  return collection.findOne({ _id: getMongoID(id) });
}

export default {
  create,
  get,
};
