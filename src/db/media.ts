import { ObjectId } from "mongodb";
import { Media } from "../types";
import db from "./db";
import { getMongoIdOrFail } from "../utils/mongo";

const collection = db.collection("media");

async function create(media: Media) {
  const { insertedId } = await collection.insertOne(media);
  return get(insertedId.toString());
}

async function get(id: string) {
  return collection.findOne({ _id: getMongoIdOrFail(id) });
}

export default {
  create,
  get,
};
