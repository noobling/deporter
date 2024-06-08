import google from "../db/google";
import plan from "../db/plan";
import { adminSendMessage } from "../utils/admin";
import dayjs from "dayjs";
import { urlsPlanView } from "../utils/urls";
import { PlanModel } from "../types";
var utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

async function getPlaceTimeInUtc(plan: PlanModel) {
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

// We can only do daily reminders for now since we don't know the plan location timezone
export async function sendOneHourToGoPlanReminder() {
  const plans = await plan.listToRemind();
  for (const item of plans) {
    const placeUtcTime = await getPlaceTimeInUtc(item);
    if (!placeUtcTime) {
      continue;
    }
    const isStartInAnHour = dayjs().isSame(placeUtcTime, "hour");

    if (isStartInAnHour) {
      console.log("Plan is starting in an hour sending notification", item);
      await adminSendMessage({
        message: `${item.note} is starting soon! 🎉`,
        eventId: item.event_id.toString(),
        route_to: urlsPlanView(item),
      });
      await plan.updateReminderSent(item._id);
    }
  }
}

export async function sendDailyPlanReminder() {
  const plans = await plan.listToRemind();
  const plansStartingTodayByEvent: Record<string, PlanModel[]> = {};
  for (const plan of plans) {
    const placeUtcTime = await getPlaceTimeInUtc(plan);

    if (!placeUtcTime) {
      continue;
    }

    const isStartingToday = dayjs().isSame(placeUtcTime, "day");

    if (isStartingToday) {
      const plansForEvent =
        plansStartingTodayByEvent[plan.event_id.toString()] || [];
      plansStartingTodayByEvent[plan.event_id.toString()] = [
        ...plansForEvent,
        plan,
      ];
    }
  }

  Object.keys(plansStartingTodayByEvent).forEach(async (eventId) => {
    const plans = plansStartingTodayByEvent[eventId];
    const eventPlans = plans.map((plan) => plan.note).join(", ");
    console.log("Sending daily plan reminder for event", eventId, eventPlans);
    await adminSendMessage({
      message: `There are ${plans.length} plans starting today, prepare yourselves 🎉: ${eventPlans}`,
      eventId,
    });
  });
}
