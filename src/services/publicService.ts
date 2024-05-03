import {
  AuthContext,
  CreateEventRequest,
  CreateMessageRequest,
  CreatePaymentRequest,
  EventResponse,
  EventsResponse,
  Expense,
  Message,
  UpdateEventRequest,
  UserResponse,
} from "../types";
import events from "../db/events";
import { getDaysToGo, getTimestamps } from "../utils/date";
import {
  cacheNotificationToProcess,
  sendPushNotification,
  sendWebsocketNotification,
  WebsocketEventType,
} from "./notificationService";
import { adminSendMessage } from "../utils/admin";
import { getMongoId, isEqual } from "../utils/mongo";
import { title } from "process";
import media from "../db/media";
import { getMedia } from "./mediaService";
import { urlencoded } from "body-parser";
import { Response } from "express";


// This file is public facing an accessible to everyone - no auth required

export async function publicGetEventById(payload: {
  id: string;
}, res: Response) {

  const event = await events.getEvent(payload.id);
  if (!event) {
    return null;
  }
  // create a deporter redirect link...
  // https://deporter.lets.lol/media/by-id?id=66323dcfe05540b9bd21311b&description=Checkout+this+cool+stuff&title=Jeremiah+deportation++-+Today+9%3A04%E2%80%AFPM&goToUrl=%2Fevent%2Fby-id%3Fid%3D661f347eb00ae385b0528bc2&photoId=661f347eb00ae385b0528bc1&image=https%3A%2F%2Fdeporter-prod.s3.ap-southeast-2.amazonaws.com%2F66323dcfe05540b9bd21311b%3FAWSAccessKeyId%3DAKIA5Z5B2C44T2RD5FHP%26Expires%3D1714577419%26Signature%3DDx1OTF2gPdkM%252F%252FvSnSgbFWP8Kdc%253D

  // fetch event photo event.photo
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

  // create a link

  const openGraph: any = {
    id: event._id,
    title: event.name,
    description: event.start_time.toLocaleLowerCase(),
  }
  if (photo?.type === 'photo')
    openGraph.image = photo?.downloadUrl;
  if (photo?.type === 'video')
    openGraph.video = photo?.downloadUrl;

  const link = {
    url: `https://deporter.lets.lol/event/by-id`,
    queryParameters:
      openGraph
  }
  // create a link to the event based on link, for loop over the query parameters
  let deporterLink = `https://deporter.lets.lol/event/by-id?`;
  for (const key in link.queryParameters) {
    console.log(key, link.queryParameters[key]);
    deporterLink += `${key}=${encodeURI(link.queryParameters[key])}&`
  }
  return res.redirect(301, deporterLink);
}
