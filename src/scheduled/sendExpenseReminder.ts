import events from "../db/events";
import users from "../db/users";
import expenseService from "../services/expenseService";
import { Reminder } from "../types";
import { adminSendMessage } from "../utils/admin";
import dayjs from "dayjs";

const frequencyTimeMap = {
  once: -1,
  daily: 24,
  weekly: 168,
  monthly: 720,
};
const shouldSendReminder = (reminder: Reminder) => {
  const timeAgoToSendAgainInHours = frequencyTimeMap[reminder.frequency];
  if (timeAgoToSendAgainInHours === -1) {
    return false;
  }

  const hasBeenEnoughTimeElapsed = dayjs(reminder.last_sent_at)
    .add(timeAgoToSendAgainInHours, "hours")
    .isBefore(dayjs());
  return hasBeenEnoughTimeElapsed;
};

export const sendExpenseReminder = async () => {
  console.log("Sending expense reminder");
  const result = await events.listEventsWithReminders();

  if (result.length === 0) {
    console.log("Skipping expense reminder, no events with reminders");
    return;
  }

  const allUsers = await users.listAll();
  for (const e of result) {
    if (!e.reminders || !e.reminders.some(shouldSendReminder)) {
      console.log("Skipping event", e.name, "no reminders to send yet");
      continue;
    }
    const debts = await expenseService.getOutstanding(e._id.toString());
    if (debts && debts.length > 0) {
      await expenseService.sendReminderDebts(e._id.toString(), debts, allUsers);
      await events.updateExpenseReminderSentAt(e._id.toString());
    }
  }
};
