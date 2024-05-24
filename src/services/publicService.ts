import events from "../db/events";
import media from "../db/media";
import plan from "../db/plan";
import users from "../db/users";
import { SharePlanResponse } from "../types";
import { getDownloadUrl } from "../utils/aws";
import { getMedia } from "./mediaService";
import { Request, Response } from "express";
import { og } from "../utils/og";

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

    if (!data) {
      console.log("Plan not found for id", planId);
      return res.status(404).send("Plan not found");
    }

    const [eventData, user] = await Promise.all([
      events.getEvent(data.event_id.toString()),
      users.getUser(data.created_by.toString()),
    ]);
    const [ogData] = await Promise.all([og(data.link)]);

    const result: SharePlanResponse = {
      title: `${data.note}`,
      description: `Starting at ${data.start_date_time}`,
      url: `deporter://${path}?planId=${planId}&id=${data.event_id}`,
      openGraphData: ogData ?? null,
      eventName: eventData?.name ?? "",
      time: data.start_date_time,
    };

    return res.render("plan", result);
  } catch (e) {
    console.error("Error sharing plan", e);
    return res.status(404).send("Not found");
  }
}
