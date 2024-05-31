import places from "../db/places";
import { Context, CreatePlaceRequest } from "../types";
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
      created_by: context.authedUser._id,
    },
    payload.googlePlace
  );

  await adminSendMessage({
    message: `${context.authedUser.name} wants to checkout ${payload.googlePlace?.displayName?.text}`,
    eventId: payload.event_id,
    route_to: `/event/map?id=${payload.event_id}&placeId=${inserted.insertedId}`,
  });
}

export async function getEventPlaces(payload: any, context: Context) {
  const placesList = await places.findByEventId(context.id);
  return placesList;
}

export async function deletePlace(payload: any, context: Context) {
  await places.deletePlace(context.id);
}
