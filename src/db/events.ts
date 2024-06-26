import { FindOptions, ObjectId, PushOperator } from "mongodb";
import {
  AddParticipantRequest,
  Event,
  EventResponse,
  Expense,
  Message,
  Payment,
  RemoveExpenseReminderRequest,
  UpdateEventRequest,
  UserResponse,
} from "../types";
import { getMongoIdOrFail, isEqual } from "../utils/mongo";
import db from "./db";
import users from "./users";
import { isAdmin } from "../utils/auth";

const collection = db.collection("event");

async function listEvents(currentUserId: string) {
  const cursor = await collection.find(
    {
      $or: [
        { participants: { $in: [currentUserId] } },
        { created_by: currentUserId },
      ],
    },
    {
      sort: {
        updated_at: -1,
      },
    }
  );
  return cursor.toArray() as unknown as EventResponse[];
}

async function listEventIds(currentUserId: string) {
  const cursor = await collection.find(
    {
      $or: [
        { participants: { $in: [currentUserId] } },
        { created_by: currentUserId },
      ],
    },
    {
      projection: {
        _id: 1,
      },
    }
  );
  return (await cursor.toArray()).map((e) => e._id.toString());
}

/**
 * Events where use is not a participant and not private event
 */
async function getEventsToJoin(currentUserId: string) {
  const cursor = await collection.find(
    {
      participants: { $nin: [currentUserId] },
      status: { $ne: "private" },
    },
    {
      sort: {
        created_at: -1,
      },
    }
  );
  const result = (await cursor.toArray()) as unknown as EventResponse[];
  return result;
}

function getEvent(
  id: string,
  options: FindOptions<Document> = {}
): Promise<EventResponse | null> {
  return collection.findOne(
    { _id: getMongoIdOrFail(id) },
    options
  ) as unknown as Promise<EventResponse>;
}

function getEventMetaData(id: string) {
  return collection.findOne(
    { _id: getMongoIdOrFail(id) },
    {
      projection: {
        messages: 0,
      },
    }
  );
}

async function createEvent(event: Event) {
  const code = await getJoinCode();
  const { insertedId } = await collection.insertOne({
    ...event,
    join_code: code,
  });

  return getEvent(insertedId.toString());
}

async function updateEvent(id: string, event: UpdateEventRequest) {
  await collection.updateOne(
    {
      _id: getMongoIdOrFail(id),
    },
    {
      $set: {
        ...event,
        updated_at: new Date().toISOString(),
      },
    }
  );

  return getEvent(id);
}

export async function addMessage(id: string, message: Message) {
  await updateList(id, {
    messages: message,
  });

  const [data, user] = await Promise.all([
    getEvent(id),
    users.getUser(message.created_by),
  ]);

  return { data, user };
}

export async function pinMessage(eventId: string, messageId: string) {
  await collection.updateOne(
    {
      _id: getMongoIdOrFail(eventId),
      "messages.id": messageId,
    },
    {
      $set: {
        "messages.$.pinned": true,
      },
    }
  );
}

export async function getMessage(eventId: string, messageId: string) {
  const event = await getEvent(eventId, {
    projection: {
      messages: {
        $elemMatch: {
          id: messageId,
        },
      },
    },
  });

  return event?.messages[0];
}

export async function addMessageReaction(
  eventId: string,
  message_id: string,
  userId: string,
  reaction: string
): Promise<{
  data: EventResponse | null;
  sender: UserResponse | null;
}> {
  // update the message with id message_id
  const updateResult = await collection
    .updateOne(
      {
        _id: getMongoIdOrFail(eventId),
        "messages.id": message_id,
      },
      {
        $set: {
          "messages.$.reactions": {
            ...{ [userId]: reaction },
          },
        },
      }
    );
  if (updateResult.modifiedCount === 0) {
    return { data: null, sender: null };
  }
  const [data, sender] = await Promise.all([
    getEvent(eventId),
    users.getUser(userId),
  ]);
  return { data, sender };
}

export async function addMessageReadReceipt(
  eventId: string,
  userId: string,
  messageId: string
) {
  await collection.updateOne(
    {
      _id: getMongoIdOrFail(eventId),
    },
    {
      $set: {
        [`read_receipts.${userId}`]: {
          message_id: messageId,
          read_at: new Date().toISOString(),
        },
      },
    }
  );
  return true;
}
/**
 * @param id eventId
 */
async function addExpense(id: string, expense: Expense) {
  await updateList(id, {
    expenses: { ...expense, id: new ObjectId() },
  });
  return getEvent(id);
}

/**
 * @param id eventId
 */
async function addExpenseAdjustment(
  eventId: string,
  expenseId: string,
  userId: string,
  value: number
) {
  return collection.updateOne(
    {
      _id: getMongoIdOrFail(eventId),
      expenses: {
        $elemMatch: {
          id: getMongoIdOrFail(expenseId),
        },
      },
    },
    {
      $set: {
        "expenses.$.adjustments": {
          [userId]: value,
        },
      },
    }
  );
}

/**
 * We may want to delete the expense by name in the future
 * @param id
 * @param expenseId
 */
async function deleteExpense(id: string, expenseId: string) {
  await collection.updateOne(
    {
      _id: getMongoIdOrFail(id),
    },
    {
      // @ts-ignore
      $pull: {
        expenses: { id: expenseId },
      },
    }
  );
}

async function addPayment(id: string, payment: Payment) {
  await updateList(id, {
    payments: payment,
  });

  return getEvent(id);
}

function addParticipants(id: string, participants: AddParticipantRequest) {
  return updateList(id, { participants: { $each: participants.participants } });
}

function updateList(id: string, push: PushOperator<Document>) {
  return collection.updateOne(
    { _id: getMongoIdOrFail(id) },
    {
      $push: push,
      $set: {
        updated_at: new Date().toISOString(),
      },
    }
  );
}

function joinByCode(code: string, userId: any) {
  return collection.updateOne(
    {
      join_code: code,
    },
    {
      $push: {
        participants: userId,
      },
      $set: {
        updated_at: new Date().toISOString(),
      },
    }
  );
}

function getByCode(code: string) {
  return collection.findOne({ join_code: code }) as unknown as EventResponse;
}

async function getEventsViewableByUser(userId: string) {
  // TODO: Don't pull the entire table to improve performance at some point
  const allEvents = (await (
    await collection.find({})
  ).toArray()) as unknown as EventResponse[];
  const allUsers = await users.getUsers();

  if (isAdmin(userId)) {
    console.log("admin user returning all events");
    return allEvents;
  }
  return allEvents.filter((event) => {
    const participating =
      event.participants.some((p) => isEqual(p, userId)) ||
      isEqual(event.created_by, userId);
    const friendsWithSomeParticipants = event.participants.some((p) => {
      const participant = allUsers.find((u) => isEqual(u._id, p));
      return participant?.friends.some((f) => isEqual(f, userId));
    });

    return (
      participating ||
      (friendsWithSomeParticipants && event.status !== "restricted")
    );
  });
}

async function listEventsWithReminders() {
  const cursor = await collection.find({
    reminders: { $exists: true, $ne: [] },
  });
  return cursor.toArray() as unknown as EventResponse[];
}

async function addExpenseReminder(
  createdById: string,
  eventId: string,
  frequency: "once" | "daily" | "weekly"
) {
  await updateList(eventId, {
    reminders: {
      created_by: getMongoIdOrFail(createdById),
      frequency,
      type: "expense",
      last_sent_at: new Date().toISOString(),
    },
  });

  return getEvent(eventId);
}

async function removeExpenseReminder(request: RemoveExpenseReminderRequest) {
  await collection.updateOne(
    {
      _id: getMongoIdOrFail(request.eventId),
    },
    {
      // @ts-ignore
      $pull: {
        reminders: {
          created_by: getMongoIdOrFail(request.owedToUserId),
          type: "expense",
        },
      },
    }
  );
}

async function updateExpenseReminderSentAt(eventId: string) {
  await collection.updateOne(
    {
      _id: getMongoIdOrFail(eventId),
    },
    {
      $set: {
        "reminders.$[].last_sent_at": new Date().toISOString(),
      },
    }
  );
}

export default {
  listEvents,
  listEventIds,
  getEvent,
  getEventMetaData,
  createEvent,
  updateEvent,
  getMessage,
  pinMessage,
  addMessage,
  addMessageReaction,
  addExpense,
  addExpenseAdjustment,
  deleteExpense,
  addParticipants,
  addPayment,
  getEventsToJoin,
  getByCode,
  joinByCode,
  getEventsViewableByUser,
  listEventsWithReminders,

  addExpenseReminder,
  removeExpenseReminder,
  updateExpenseReminderSentAt,
};

async function getJoinCode() {
  for (let i = 0; i < 10; i++) {
    const code = createRandomString(4);
    const exists = await collection.findOne({ join_code: code });
    if (!exists) return code;
  }

  console.error("Failed to generate unique join code returning XXXX");
  return "XXXX";
}
function createRandomString(length: number) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
