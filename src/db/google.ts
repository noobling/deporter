import { ObjectId } from "mongodb";
import { getTimestamps } from "../utils/date";
import db from "./db";
import {
  GooglePlace,
  GooglePlaceDto,
  PlacePhoto,
  PlaceResponse,
} from "../googleTypes";
import { get } from "http";
import { getMongoIdOrFail } from "../utils/mongo";

const googleSearchCache = db.collection("google_search");
const googlePlace = db.collection("google_place");

async function create(
  query: string,
  location: { latitude: number; longitude: number },
  placeIds: ObjectId[]
) {
  const locationString = `${location.latitude.toFixed(
    2
  )},${location.longitude.toFixed(2)}`;

  return googleSearchCache.insertOne({
    query,
    location_string: locationString,
    placeIds,
    ...getTimestamps(),
  });
}

async function findOrCreatePlace(place: PlaceResponse) {
  const found = await googlePlace.findOne({
    id: place.id,
  });

  if (!found) {
    const inserted = await googlePlace.insertOne({
      ...place,
      ...getTimestamps(),
    });
    return inserted.insertedId;
  }

  return found._id;
}

async function find(
  query: string,
  location: { latitude: number; longitude: number }
) {
  const locationString = `${location.latitude.toFixed(
    2
  )},${location.longitude.toFixed(2)}`;

  return googleSearchCache.findOne({
    query,
    location_string: locationString,
  });
}

async function findPlaceById(id: string) {
  return googlePlace.findOne({
    _id: getMongoIdOrFail(id),
  }) as Promise<GooglePlaceDto | null>;
}

async function findPlaces(placeIds: ObjectId[]) {
  const cursor = await googlePlace.find({
    _id: {
      $in: placeIds,
    },
  });

  return cursor.toArray() as Promise<GooglePlace[]>;
}

async function updateDownloadedPhotos(id: string, downloadedPhotos: string[]) {
  await googlePlace.updateOne(
    {
      _id: getMongoIdOrFail(id),
    },
    {
      $set: {
        downloadedPhotos: downloadedPhotos,
      },
    }
  );
}

async function updatePhotos(id: string, photos: PlacePhoto[]) {
  await googlePlace.updateOne(
    {
      _id: getMongoIdOrFail(id),
    },
    {
      $set: {
        photos,
      },
    }
  );
}

export default {
  create,
  find,
  findPlaceById,
  findOrCreatePlace,
  updateDownloadedPhotos,
  updatePhotos,
  findPlaces,
};
