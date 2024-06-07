import google from "../db/google";
import plan from "../db/plan";
import { adminSendMessage } from "../utils/admin";
import dayjs from "dayjs";
var utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

// We can only do daily reminders for now since we don't know the plan location timezone
export async function sendOneHourToGoPlanReminder() {
  const plans = await plan.listAll();
  for (const plan of plans) {
    let googPlace = null;
    if (plan.google_place_id) {
      googPlace = await google.findPlaceById(plan.google_place_id);
    }
    const utcOffset = googPlace?.utcOffsetMinutes ?? 0;
    // @ts-ignore
    const placeUtcTime = dayjs.utc(plan.start_date_time).utcOffset(utcOffset);

    const isStartInAnHour = dayjs().isSame(placeUtcTime, "hour");

    if (isStartInAnHour) {
      console.log("Plan is starting in an hour sending notification", plan);
      await adminSendMessage({
        message: `${plan.note} is starting in an hour! 🎉`,
        eventId: plan.event_id.toString(),
        route_to: `/event/plan/edit?id=${plan.event_id}&planId=${plan._id}`,
      });
    }
  }
}

export async function sendDailyPlanReminder() {
  const plans = await plan.listAll();

  for (const plan of plans) {
    let googPlace = null;
    if (plan.google_place_id) {
      googPlace = await google.findPlaceById(plan.google_place_id);
    }
    const utcOffset = googPlace?.utcOffsetMinutes ?? 0;
    // @ts-ignore
    const placeUtcTime = dayjs.utc(plan.start_date_time).utcOffset(utcOffset);

    const isStartingToday = dayjs().isSame(placeUtcTime, "day");

    if (isStartingToday) {
      console.log("Plan is starting today sending notification", plan);
      await adminSendMessage({
        message: `${plan.note} is starting today prepare yourselves! 🎉`,
        eventId: plan.event_id.toString(),
        route_to: `/event/plan/edit?id=${plan.event_id}&planId=${plan._id}`,
      });
    }
  }
}
