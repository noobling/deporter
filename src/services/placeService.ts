import places from "../db/places";
import { Context, CreatePlaceRequest, UpdatePlaceRequest } from "../types";
import { adminSendMessage } from "../utils/admin";
import { getMongoId } from "../utils/mongo";

export async function createPlace(
  payload: CreatePlaceRequest,
  context: Context
) {
  const inserted = await places.create(
    {
      note: payload.note,
      event_id: getMongoId(payload.event_id),
      created_by: getMongoId(context.authedUser._id),
    },
    payload.googlePlace
  );
  const note = payload.note ? ` with note: ${payload.note}` : "";
  await adminSendMessage({
    message: `${context.authedUser.name} wants to checkout ${payload.googlePlace?.displayName?.text}${note}`,
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
