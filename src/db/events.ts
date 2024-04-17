import { FindOptions, ObjectId, PushOperator } from "mongodb";
import {
  AddParticipantRequest,
  Event,
  EventResponse,
  Expense,
  Message,
  Payment,
} from "../types";
import { getMongoID } from "../utils/mongo";
import db from "./db";
import {
  sendPushNotification,
  sendWebsocketNotification,
  WebsocketEventType,
} from "../services/notificationService";
import users from "./users";

const collection = db.collection("event");

async function listEvents(currentUserId: string) {
  const cursor = await collection.find({
    $or: [
      { participants: { $in: [currentUserId] } },
      { created_by: currentUserId },
    ],
  });
  return cursor.toArray() as unknown as EventResponse[];
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
    { _id: getMongoID(id) },
    options
  ) as unknown as Promise<EventResponse>;
}

function getEventMetaData(id: string) {
  return collection.findOne(
    { _id: getMongoID(id) },
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

async function addMessage(id: string, message: Message) {
  await updateList(id, {
    messages: message,
  });

  const [data, user] = await Promise.all([
    getEvent(id),
    users.getUser(message.created_by),
  ]);

  // Add notifications to q
  if (data) {
    const participants = data.participants.filter(
      (p) => p !== message.created_by
    );

    const photoCount = message.media.length;
    const description =
      photoCount > 0 ? `Sent ${photoCount} photo(s)` : message.content;
    const url = `/(event)/chat?id=${data._id}`;
    for (const userId of participants) {
      sendPushNotification(userId, {
        type: WebsocketEventType.ROUTING_PUSH_NOTIFICATION,
        payload: {
          goTo: url,
          title: `${user.name} (${data.name})`,
          description,
        },
      });
      sendWebsocketNotification(userId, {
        type: WebsocketEventType.MESSAGE_NOTIFICATION,
        payload: {
          eventId: data._id.toString(),
        },
      });
    }
  }

  return data;
}

async function addExpense(id: string, expense: Expense) {
  await updateList(id, {
    expenses: expense,
  });

  return getEvent(id);
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
    { _id: getMongoID(id) },
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

export default {
  listEvents,
  getEvent,
  getEventMetaData,
  createEvent,
  addMessage,
  addExpense,
  addParticipants,
  addPayment,
  getEventsToJoin,
  getByCode,
  joinByCode,
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
