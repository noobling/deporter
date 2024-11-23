import cron from "node-cron";
import { sendEventReminder } from "./services/eventService";
import { adminSendMessage } from "./utils/admin";
import { processNotificationsFromCache } from "./services/notificationService";
import {
  sendDailyPlanReminder,
  sendOneHourToGoPlanReminder,
} from "./scheduled/processNotificationsForUpcommingPlans";
import { sendExpenseReminder } from "./scheduled/sendExpenseReminder";
import { updateDateTimeForRecurringPlans } from "./scheduled/updateDateTimeForRecurringPlans";
import { fetchFriends } from "./scheduled/fetchFriends";

const HOURLY_CRON = "0 * * * *";

export const startCronJobs = () => {
  // Every 24 hours send event count down
  cron.schedule("0 0 * * *", async () => {
    console.log("Sending event reminder every 24 hours");
    try {
      await sendEventReminder();
      console.log("Success sending event reminder");
    } catch (err) {
      console.error("Error sending event reminder", err);
      await adminSendMessage({
        message: `Error sending event reminder: ${err}`,
        eventId: "661ceba8b2463e6fca862ffb", // Developer chat
      });
    }
  });

  // Every 5 seconds process notifications to send
  cron.schedule("*/5 * * * * *", processNotificationsFromCache);

  // Check and send one hour to go plan reminder every minute
  cron.schedule("* * * * *", async () => {
    console.log("Sending one hour to go plan reminder");
    try {
      await sendOneHourToGoPlanReminder();
    } catch (err) {
      console.error("Failed sending hourly reminder", err);
    }
  });

  // every 24 hours send plan reminder starting in 24 hours
  cron.schedule("0 0 * * *", async () => {
    console.log("Sending plan reminder every 24 hours");
    sendDailyPlanReminder();
  });

  // every hour update start time for recurring plans
  cron.schedule(HOURLY_CRON, updateDateTimeForRecurringPlans);

  // every hour check and send expense reminders
  cron.schedule(HOURLY_CRON, async () => {
    console.log("Sending expense reminder every hour");
    sendExpenseReminder();
  });

  // every day fetch friends
  cron.schedule("0 0 * * *", async () => {
    console.log("Fetching friends every day");
    fetchFriends();
  });

  console.log("Scheduled cron jobs");
};
