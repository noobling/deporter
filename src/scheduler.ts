import cron from "node-cron";
import { sendEventReminder } from "./services/eventService";
import { adminSendMessage } from "./utils/admin";
import { processNotificationsFromCache } from "./services/notificationService";

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
  // cron.schedule("*/5 * * * * *", async () => {
  //   await processNotificationsFromCache();
  // });

  // Every 12 hours process upcoming plans
  cron.schedule("0 */12 * * *", async () => {
    console.log("Processing notifications for upcoming plans");
    await processNotificationsFromCache();
  });

  console.log("Scheduled cron jobs");
};
