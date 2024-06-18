import events from "../db/events";
import users from "../db/users";
import expenseService from "../services/expenseService";
import { adminSendMessage } from "../utils/admin";

export const sendExpenseReminder = async () => {
  console.log("Sending expense reminder");
  const result = await events.listAll();
  const allUsers = await users.listAll();
  for (const e of result) {
    const debts = await expenseService.getOutstanding(e._id.toString());
    if (
      debts &&
      debts.length > 0 &&
      e._id.toString() === "661f347eb00ae385b0528bc2"
    ) {
      let owedMessage = "💸 Settle your debts with your mates 💸\n";
      owedMessage += debts
        .map((d) => {
          const user = allUsers.find((u) => u._id.toString() === d.userId);
          const owedTo = allUsers.find((u) => u._id.toString() === d.owedToId);
          const name = user?.name ?? d.userId;
          const owedToName = owedTo?.name ?? d.owedToId;
          return `@${name} owes @${owedToName} $${d.amount.toFixed(2)}`;
        })
        .join("\n");

      await adminSendMessage({
        eventId: e._id.toString(),
        message: owedMessage,
      });
    }
  }
};
