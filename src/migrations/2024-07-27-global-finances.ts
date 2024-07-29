import db from "../db/db";
import { Event } from "../types";

import expenseRepo from "../db/expense";
import { Currency } from "../types/moneyTransactionDto";

async function migrateExpenses() {
  const events = db.collection("event");
  const c = events.find()
  while (await c.hasNext()) {
    const event = await c.next() as unknown as Event & { _id: any } | undefined;
    if (!event) {
      break;
    }
    console.log("Event", event._id);
    for (const expense of event.expenses) {
      await expenseRepo.createMoneyTransaction({
        amount: expense.amount,

        context: {
          id: event._id,
          type: "event"
        },

        applicable_to: expense.applicable_to.map((id) => id.toString()),
        adjustments: expense.adjustments,

        currency: Currency.AUD,
        media: expense.media,
        name: expense.name,

        owed_to: expense.payer?.toString() || expense.created_by.toString(),

        type: "expense",


        created_at: expense.created_at,
        updated_at: expense.updated_at

      }, expense.created_by.toString());
    }

    // make transactions for every payment
    for (const payment of event.payments) {
      await expenseRepo.createMoneyTransaction({
        amount: Math.abs(payment.amount),
        context: {
          id: event._id,
          type: "event"
        },
        applicable_to: [payment.paid_to.toString()],
        currency: Currency.AUD,
        media: [],
        name: "Payment",
        owed_to: payment.created_by.toString(),
        type: "payment",
        adjustments: {},
        created_at: payment.created_at,
        updated_at: payment.updated_at
      }, payment.created_by.toString());
    }
  }
}
