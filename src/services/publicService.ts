import events from "../db/events";
import { getMedia } from "./mediaService";
import { Response } from "express";


// This file is public facing an accessible to everyone - no auth required
export async function publicGetEventById(payload: {
  id: string;
}, res: Response) {
  const event = await events.getEvent(payload.id);
  if (!event) {
    return null;
  }
  const photo = event.photo ? (await getMedia({}, {
    id: event.photo,
    authedUser: {
      _id: "",
      sub: "",
      name: "",
      email: "",
      friends: [],
      created_at: "",
      updated_at: ""
    },
    queryParams: {}
  })) : null;
  const openGraph: any = {
    id: event._id,
    title: event.name,
    description: event.start_time.toLocaleLowerCase(),
  }
  if (photo) {
    if (photo.type.startsWith('image')) {
      openGraph.image = photo?.downloadUrl;
    } else {
      openGraph.video = photo?.downloadUrl;
    }
  }
  const link = {
    url: `https://deporter.lets.lol/event/by-id`,
    queryParameters:
      openGraph
  }
  // create a link to the event based on link, for loop over the query parameters
  let deporterLink = `https://deporter.lets.lol/event/by-id?`;
  for (const key in link.queryParameters) {
    deporterLink += `${key}=${encodeURIComponent(link.queryParameters[key])}&`
  }
  return res.redirect(301, deporterLink);
}