import plan from "../db/plan";
import { adminSendMessage } from "../utils/admin";

// We can only do daily reminders for now since we don't know the plan location timezone
export async function processNotificationsForUpcomingPlans() {
  const plans = await plan.listAll();

  for (const plan of plans) {
    const isStartingToday =
      new Date(plan.start_date_time).getDate() === new Date().getDate();

    if (isStartingToday) {
      console.log("Plan is starting today sending notification", plan);
      await adminSendMessage({
        message: `${plan.note} is starting today prepare yourselves! 🎉`,
        eventId: plan.event_id.toString(),
        routeTo: `/event/plan/edit?id=${plan._id}`,
      });
    }
  }
}
