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

async function addEventId(id: string, eventId: string) {
  const result = await collection.updateOne(
    { _id: getMongoIdOrFail(id) },
    {
      $set: {
        eventId,
      },
    }
  );
  return result;
}

export default {
  create,
  get,
  addEventId,
};
