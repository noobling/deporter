import { ObjectId } from "mongodb";
import db from "../db/db";
import { Expense } from "../types";

export async function addExpenseIds() {
  // timeout for 5 seconds
  setTimeout(async () => {
    const events = db.collection("event");
    const c = events.find()
    while (await c.hasNext()) {
      const event = await c.next();
      if (!event) {
        break;
      }
      console.log("Event", event._id);
      // update each expense that doesn't have an id
      event.expenses = event.expenses.map((expense: Expense) => {
        if (!expense.id) {
          expense.id = new ObjectId();
        }
        return expense;
      });
      await events.updateOne(
        { _id: event._id },
        {
          $set: {
            expenses: event.expenses,
          },
        }
      );
    }
    process.exit(0);
  }, 5000);
}

addExpenseIds();
