import events from "../db/events";
import media from "../db/media";
import plan from "../db/plan";
import users from "../db/users";

import { Request, Response } from "express";
import google from "../db/google";
import { getDownloadUrl } from "../utils/aws";
import { og } from "../utils/og";
import { getMedia } from "./mediaService";
import dayjs from "dayjs";
var utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

// This file is public facing an accessible to everyone - no auth required
export async function publicGetEventById(
  payload: {
    id: string;
  },
  res: Response
) {
  const event = await events.getEvent(payload.id);
  if (!event) {
    return null;
  }
  const photo = event.photo
    ? await getMedia(
        {},
        {
          id: event.photo,
          authedUser: {
            _id: "",
            sub: "",
            name: "",
            email: "",
            friends: [],
            created_at: "",
            updated_at: "",
          },
          queryParams: {},
        }
      )
    : null;
  const openGraph: any = {
    id: event._id,
    title: event.name,
    description: event.start_time.toLocaleLowerCase(),
  };
  if (photo) {
    if (photo.type.startsWith("image")) {
      openGraph.image = photo?.downloadUrl;
    } else {
      openGraph.video = photo?.downloadUrl;
    }
  }
  const link = {
    url: `https://deporter.lets.lol/event/by-id`,
    queryParameters: openGraph,
  };
  // create a link to the event based on link, for loop over the query parameters
  let deporterLink = `https://deporter.lets.lol/event/by-id?`;
  for (const key in link.queryParameters) {
    deporterLink += `${key}=${encodeURIComponent(link.queryParameters[key])}&`;
  }
  return res.redirect(301, deporterLink);
}

export async function sharePlan(req: Request, res: Response) {
  try {
    const planId = req.params.id;
    const { path } = req.query;
    const data = await plan.find(planId);
    const placeId = data.google_place_id;
    const googlePlace = placeId ? await google.findPlaceById(placeId) : null;
    let image = "";
    if (googlePlace?.downloadedPhotos) {
      const result = await media.get(googlePlace.downloadedPhotos[0]);
      image = await getDownloadUrl(result.s3Key!);
    }

    if (!data) {
      console.log("Plan not found for id", planId);
      return res.status(404).send("Plan not found");
    }

    const [eventData, user] = await Promise.all([
      events.getEvent(data.event_id.toString()),
      users.getUser(data.created_by.toString()),
    ]);
    const utcTimeExample = dayjs
      // @ts-ignore
      .utc(data.start_date_time)
      .utcOffset(-(googlePlace?.utcOffsetMinutes ?? 0))
      .format("hh:mm A, D MMM, YYYY");

    const dateTime = dayjs(data.start_date_time).format("hh:mm A, D MMM, YYYY");

    const result = {
      title: `${data.note}`,
      description: `Starting at ${data.start_date_time}`,
      url: `deporter://${path}?id=${planId}&eventId=${data.event_id}`,
      image,
      location: googlePlace?.displayName?.text ?? "",
      address: googlePlace?.formattedAddress ?? "",
      mapLink: googlePlace?.googleMapsUri ?? "",
      eventName: eventData?.name ?? "",
      time: dateTime,
    };

    return res.render("plan", result);
  } catch (e) {
    console.error("Error sharing plan", e);
    return res.status(404).send("Not found");
  }
}
