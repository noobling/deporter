import cron from "node-cron";
import { sendEventReminder } from "./services/eventService";
import { adminSendMessage } from "./utils/admin";
import { processNotificationsFromCache } from "./services/notificationService";
import {
  sendDailyPlanReminder,
  sendOneHourToGoPlanReminder,
} from "./scheduled/processNotificationsForUpcommingPlans";

export const startCronJobs = () => {
  // Every 24 hours
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

  // Every 5 seconds
  cron.schedule("*/5 * * * * *", async () => {
    await processNotificationsFromCache();
  });

  // Every hour process
  cron.schedule("*/5 * * * * *", async () => {
    console.log("Sending one hour to go plan reminder");
    try {
      await sendOneHourToGoPlanReminder();
    } catch (err) {
      console.error("Failed sending hourly reminder", err);
    }
  });

  // every 24 hours
  cron.schedule("0 0 * * *", async () => {
    console.log("Sending plan reminder every 24 hours");
    sendDailyPlanReminder();
  });

  console.log("Scheduled cron jobs");
};
