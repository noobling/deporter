import dayjs from "dayjs";
import google from "../db/google";
import { PlanModel } from "../types";

export async function getPlaceTimeInUtc(plan: PlanModel) {
  let googPlace = null;
  if (plan.google_place_id) {
    googPlace = await google.findPlaceById(plan.google_place_id);
  }
  if (!googPlace) {
    // Can't accurately send reminder without timezone info
    return null;
  }
  const utcOffset = googPlace?.utcOffsetMinutes ?? 0;
  return dayjs(`${plan.start_date_time}Z`).add(-utcOffset, "minute");
}
