import { ObjectId } from "mongodb";
import {
  CreatePlan,
  CreatePlanRequest,
  PlanModel,
  UpdatePlanRequest,
} from "../types";
import { getTimestamps, getUpdatedTimestamps } from "../utils/date";
import { getMongoIdOrFail } from "../utils/mongo";
import db from "./db";

const collection = db.collection("plan");

async function create(plan: CreatePlan) {
  const result = await collection.insertOne({
    ...plan,
    ...getTimestamps(),
  });

  return collection.findOne({
    _id: result.insertedId,
  }) as unknown as Promise<PlanModel>;
}

async function update(planId: string, plan: UpdatePlanRequest) {
  return collection.updateOne(
    {
      _id: getMongoIdOrFail(planId),
    },
    {
      $set: {
        ...plan,
        updated_at: new Date().toISOString(),
      },
    }
  );
}

async function list(eventId: string) {
  const cursor = await collection.find(
    {
      event_id: getMongoIdOrFail(eventId),
    },
    {
      sort: {
        start_date_time: -1,
      },
    }
  );

  return cursor.toArray() as unknown as PlanModel[];
}

async function listToRemind() {
  const cursor = await collection.find({
    $or: [{ "reminder.sent": false }, { reminder: { $exists: false } }],
    google_place_id: { $exists: true },
  });

  return cursor.toArray() as unknown as PlanModel[];
}

async function listForEvents(eventIds: string[]) {
  const cursor = await collection.find(
    {
      event_id: {
        $in: eventIds.map(getMongoIdOrFail),
      },
    },
    {
      sort: {
        start_date_time: -1,
      },
    }
  );

  return cursor.toArray() as unknown as PlanModel[];
}

async function deletePlan(planId: string) {
  return collection.deleteOne({
    _id: getMongoIdOrFail(planId),
  });
}

async function find(planId: string) {
  const result = collection.findOne({
    _id: getMongoIdOrFail(planId),
  });

  return result as unknown as PlanModel;
}

async function updateReminderSent(planId: ObjectId) {
  return collection.updateOne(
    {
      _id: planId,
    },
    {
      $set: {
        reminder: {
          sent: true,
          sent_at: new Date().toISOString(),
        },
      },
    }
  );
}

export default {
  list,
  create,
  update,
  deletePlan,
  find,
  listToRemind,
  listForEvents,
  updateReminderSent,
};
