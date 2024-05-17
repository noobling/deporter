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
  return collection.insertOne({
    ...plan,
    ...getTimestamps(),
  });
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
        start_date_time: 1,
      },
    }
  );

  return cursor.toArray() as unknown as PlanModel[];
}

export default {
  list,
  create,
  update,
};
