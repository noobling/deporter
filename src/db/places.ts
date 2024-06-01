import { ObjectId } from "mongodb";
import { GooglePlace } from "../googleTypes";
import { getTimestamps } from "../utils/date";
import { getMongoIdOrFail } from "../utils/mongo";
import db from "./db";
import { Place } from "../types";

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
  const cursor = await place.find({
    event_id: getMongoIdOrFail(eventId),
  });

  return cursor.toArray() as Promise<Place[]>;
}

async function deletePlace(placeId: string) {
  return place.deleteOne({
    _id: getMongoIdOrFail(placeId),
  });
}

async function findAllGooglePlaces() {
  const cursor = await googlePlace.find({});
  return cursor.toArray() as unknown as Promise<GooglePlace[]>;
}

export default { create, findByEventId, deletePlace, findAllGooglePlaces };
