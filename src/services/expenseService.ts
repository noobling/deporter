import { ObjectId } from "mongodb";
import events from "../db/events";

const getOutstanding = async (eventId: string) => {
  const event = await events.getEvent(eventId);

  if (!event) {
    return null;
  }

  // Get total owed
  const outstanding = event.expenses.reduce((acc, e) => {
    const perUserAmount = e.amount / e.applicable_to.length;
    e.applicable_to.forEach((userId) => {
      const byUserId = e.created_by.toString();
      if (userId !== byUserId) {
        const key = `${userId}:${byUserId}`;
        acc[key] = acc[key] ? acc[key] + perUserAmount : perUserAmount;
      }
    });

    return acc;
  }, {} as Record<string, number>);

  // Minus payments
  event.payments.forEach((p) => {
    const userId = p.created_by.toString();
    const key = `${userId}:${p.paid_to}`;
    outstanding[key] -= p.amount;
  });

  // Balance out debts
  const balanced: {
    userId: string;
    owedToId: string;
    amount: number;
  }[] = [];
  Object.keys(outstanding).forEach((key) => {
    const inverseKey = key.split(":").reverse().join(":");
    const amount = outstanding[key];
    const inverseAmount = outstanding[inverseKey];

    if (!inverseAmount) {
      if (amount > 0.1) {
        return balanced.push({
          userId: key.split(":")[0],
          owedToId: key.split(":")[1],
          amount,
        });
      }
      return;
    }

    const owedToUser =
      amount > inverseAmount ? key.split(":")[1] : key.split(":")[0];
    const userId =
      amount > inverseAmount ? key.split(":")[0] : key.split(":")[1];

    const owed =
      amount >= inverseAmount ? amount - inverseAmount : inverseAmount - amount;

    if (balanced.find((b) => b.userId === userId) || owed < 0.1 || !owed) {
      return;
    }

    balanced.push({
      userId,
      owedToId: owedToUser,
      amount: owed,
    });
  });

  return balanced;
};

export default {
  getOutstanding,
};

export interface ExpenseOutstanding {
  userId: ObjectId; // User who owes money
  owedToId: ObjectId; // Who they owe money to
  amount: number; // Amount they owe
}
