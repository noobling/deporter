import { ObjectId } from "mongodb";
import events from "../db/events";
import {
  AddExpenseReminderRequest,
  Context,
  RemoveExpenseReminderRequest,
  User,
  UserResponse,
} from "../types";
import { adminSendMessage } from "../utils/admin";
import users from "../db/users";
import expenses from "../db/expense";
import { CreateMoneyTransaction, getMoneyTransactionsFilter, MoneyTransactionAdjustment } from "../types/MoneyTransactionDto";


const createMoneyTransaction = async (payload: CreateMoneyTransaction, context: Context) => {
  const userId = context.authedUser._id.toString();
  const expense = await expenses.createMoneyTransaction(payload, userId);
  return expense;
}

const getMoneyTransactions = async (payload: getMoneyTransactionsFilter, context: Context) => {
  // all related transactions for user and context
  const userId = context.authedUser._id.toString();
  const result = await expenses.getMoneyTransaction(payload, userId);
  return result;
}

const deleteMoneyTransaction = async (payload: {
  _id: string;
}, context: Context) => {
  const userId = context.authedUser._id.toString();
  await expenses.deleteMoneyTransaction(payload._id, userId);
}

const addMoneyTransactionAdjustment = async (payload: MoneyTransactionAdjustment, context: Context) => {
  const userId = context.authedUser._id.toString();
  await expenses.addMoneyTransactionAdjustment(payload.id, userId, {
    [userId]: payload.amount
  });
}

const getOutstanding = async (eventId: string): Promise<Debt[]> => {
  const event = await events.getEvent(eventId);

  if (!event) {
    return [];
  }

  // Get total owed
  const outstanding = event.expenses.reduce((acc, e) => {
    const perUserAmount = e.amount / e.applicable_to.length;
    e.applicable_to.forEach((userId) => {
      const byUserId = e.created_by.toString();
      if (userId !== byUserId) {
        const amount = e?.adjustments?.[userId] ?? perUserAmount;
        const key = `${userId}:${byUserId}`;
        acc[key] = acc[key] ? acc[key] + amount : amount;
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

export interface Debt {
  userId: string;
  owedToId: string;
  amount: number;
}

const sendReminderDebts = async (
  eventId: string,
  debts: Debt[],
  users: UserResponse[]
) => {
  let owedMessage = "💸 Settle your debts with your mates 💸\n";
  owedMessage += debts
    .map((d) => {
      const user = users.find((u) => u._id.toString() === d.userId);
      const owedTo = users.find((u) => u._id.toString() === d.owedToId);
      const name = user?.name ?? d.userId;
      const owedToName = owedTo?.name ?? d.owedToId;
      return `${name} owes ${owedToName} $${d.amount.toFixed(2)}`;
    })
    .join("\n");

  await adminSendMessage({
    eventId,
    message: owedMessage,
  });
};

const addReminder = async (
  payload: AddExpenseReminderRequest,
  context: Context
) => {
  // Fire off a message first so the user knows it works
  const debts = await getOutstanding(payload.eventId);
  const allUsers = await users.listAll();
  await sendReminderDebts(payload.eventId, debts, allUsers);

  // Already sent once no need
  if (payload.frequency === "once") {
    return;
  }

  // Schedule it
  await events.addExpenseReminder(
    payload.owedToUserId,
    payload.eventId,
    payload.frequency
  );
};

const removeReminder = async (
  payload: RemoveExpenseReminderRequest,
  context: Context
) => {
  console.log("removeReminder", payload.owedToUserId, payload.eventId);
  await events.removeExpenseReminder(payload);
};

export default {
  getOutstanding,
  addReminder,
  removeReminder,
  sendReminderDebts,
  createMoneyTransaction,
  getMoneyTransactions,
  deleteMoneyTransaction,
  addMoneyTransactionAdjustment,
};

export interface ExpenseOutstanding {
  userId: ObjectId; // User who owes money
  owedToId: ObjectId; // Who they owe money to
  amount: number; // Amount they owe
}
