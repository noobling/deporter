import cron from "node-cron";
import { sendEventReminder } from "./services/eventService";
import { adminSendMessage } from "./utils/admin";

export const startCronJobs = () => {
  // Every 60 minutes run the task
  cron.schedule("0 */60 * * * *", async () => {
    console.log("Sending event reminder every 60 minutes");
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

  console.log("Schedule cron jobs");
};
