import { ObjectId } from "mongodb";
import { GooglePlace } from "../googleTypes";
import { getTimestamps } from "../utils/date";
import { getMongoIdOrFail } from "../utils/mongo";
import db from "./db";

const place = db.collection("place");
const googlePlace = db.collection("google_place");

async function create(
  placeToCreate: { note: string; event_id: ObjectId; created_by: string },
  googToCreate: GooglePlace
) {
  const inserted = await googlePlace.insertOne(googToCreate);
  return place.insertOne({
    ...placeToCreate,
    ...getTimestamps(),
    google_place_id: inserted.insertedId,
  });
}

async function findByEventId(eventId: string) {
  return place.find({
    event_id: getMongoIdOrFail(eventId),
  });
}

async function deletePlace(placeId: string) {
  return place.deleteOne({
    _id: getMongoIdOrFail(placeId),
  });
}

export default { create, findByEventId, deletePlace };
