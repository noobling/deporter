import { ObjectId } from "mongodb";
import { GooglePlace } from "../googleTypes";
import { getTimestamps } from "../utils/date";
import { getMongoIdOrFail } from "../utils/mongo";
import db from "./db";
import { Place } from "../types";

const place = db.collection("place");
const googlePlace = db.collection("google_place");

async function create(
  placeToCreate: { note: string; event_id: ObjectId; created_by: ObjectId },
  googToCreate: GooglePlace
) {
  const inserted = await googlePlace.insertOne({
    ...googToCreate,
    ...getTimestamps(),
  });

  return place.insertOne({
    ...placeToCreate,
    google_place_id: inserted.insertedId,
    ...getTimestamps(),
  });
}

async function update(placeId: string, note: string) {
  await place.updateOne(
    {
      _id: getMongoIdOrFail(placeId),
    },
    {
      $set: {
        note: note,
      },
    }
  );

  return findById(placeId) as Promise<Place>;
}

async function findById(placeId: string) {
  return place.findOne({
    _id: getMongoIdOrFail(placeId),
  });
}

async function findByEventId(eventId: string) {
  const pipeline = [
    {
      $match: {
        event_id: getMongoIdOrFail(eventId),
      },
    },
    {
      $lookup: {
        from: "google_place",
        localField: "google_place_id",
        foreignField: "_id",
        as: "google_place",
      },
    },
    {
      $unwind: "$google_place",
    },
  ];

  const cursor = await place.aggregate(pipeline);

  return cursor.toArray() as Promise<(Place & { google_place: GooglePlace })[]>;
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

export default {
  create,
  update,
  findByEventId,
  deletePlace,
  findAllGooglePlaces,
};
