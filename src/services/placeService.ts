import google from "../db/google";
import media from "../db/media";
import places from "../db/places";
import { PlacePhoto, PlaceResponse } from "../googleTypes";
import { createPlaceSchema } from "../schemas";
import {
  Context,
  CreatePlaceRequest,
  Media,
  UpdatePlaceRequest,
} from "../types";
import { adminSendMessage } from "../utils/admin";
import { uploadToS3 } from "../utils/aws";
import { getTimestamps } from "../utils/date";
import { NotFound } from "../utils/handler";
import { getMongoId } from "../utils/mongo";
import {
  googleApiPhoto,
  googleApiPlaceDetails,
  googleApiSearch,
} from "./googleApi";
import { v4 as uuidv4 } from "uuid";

export async function createPlace(
  payload: CreatePlaceRequest,
  context: Context
) {
  const validated = await createPlaceSchema.validate(payload);
  const googPlaceExists = await google.findPlaceById(validated.google_place_id);
  if (!googPlaceExists) {
    throw new Error(`Google place ${validated.google_place_id} does not exist`);
  }
  const inserted = await places.create({
    note: payload.note,
    event_id: getMongoId(payload.event_id),
    created_by: getMongoId(context.authedUser._id),
    google_place_id: getMongoId(validated.google_place_id),
  });
  const note = payload.note ? ` with note: ${payload.note}` : "";
  await adminSendMessage({
    message: `${context.authedUser.name} wants to checkout ${googPlaceExists?.displayName?.text}${note}`,
    eventId: payload.event_id,
    route_to: `/event/map?id=${payload.event_id}&placeId=${inserted.insertedId}`,
  });
}

export async function updatePlace(
  payload: UpdatePlaceRequest,
  context: Context
) {
  const updated = await places.update(context.id, payload.note);
  const eventId = updated.event_id.toString();
  await adminSendMessage({
    message: `${context.authedUser.name} updated note in place: ${updated.google_place.displayName.text}`,
    eventId,
    route_to: `/event/map?id=${eventId}&placeId=${context.id}`,
  });
}

export async function getEventPlaces(payload: any, context: Context) {
  const placesList = await places.findByEventId(context.id);
  return placesList;
}

export async function deletePlace(payload: any, context: Context) {
  await places.deletePlace(context.id);
}

export async function getGooglePlaces() {
  return places.findAllGooglePlaces();
}

export async function searchForPlaces(payload: any, context: Context) {
  const { query, location } = payload;
  let found = await google.find(query, location);
  if (found) {
    console.log("Found existing places", found.placeIds.length, "places");
    return google.findPlaces(found.placeIds);
  } else {
    const results = await googleApiSearch(query, location);
    const places = results.places ?? [];

    const promises = places.map(async (place) => {
      return google.findOrCreatePlace(place);
    });

    const placeIds = await Promise.all(promises);
    await google.create(query, location, placeIds);

    console.log("Done creating", places.length, "places");

    return google.findPlaces(placeIds);
  }
}

// Get google place and backfill data if needed
export async function getGooglePlace(payload: any, context: Context) {
  const id = context.id;
  const place = await google.findPlaceById(id);

  if (!place) {
    throw new NotFound(`Google place ${id} not found`);
  }

  let placePhotos: PlacePhoto[] = place?.photos ?? [];
  if (!placePhotos.length) {
    try {
      const details = await googleApiPlaceDetails(place.id);
      placePhotos = details.photos ?? [];
    } catch (err) {
      console.error("Error getting place details", err);
    }
  }

  // When not downloaded photos
  if (!place.downloadedPhotos) {
    const promises = placePhotos.slice(0, 5).map(async (p) => {
      return uploadPhotoToS3(p.name);
    }); // Don't take all photos to save money
    const photos = await Promise.all(promises);
    const photoIds = photos.map((p) => p._id);
    console.log("Downloaded photos", photos.length, "photos");
    await google.updateDownloadedPhotos(id, photoIds, placePhotos);
    return { ...place, downloadedPhotos: photoIds };
  }

  return place;
}

async function uploadPhotoToS3(name: string) {
  const photo = await googleApiPhoto(name);
  const key = `google/${uuidv4()}.jpg`; // Assume jpg
  const mediaItem: Media = {
    name: name,
    created_by: "google",
    type: "image",
    extension: "jpg",
    s3Key: key,
    ...getTimestamps(),
  };

  const [created] = await Promise.all([
    media.create(mediaItem),
    uploadToS3(photo.photoUri, key),
  ]);

  return created;
}
