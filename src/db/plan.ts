import { ObjectId } from "mongodb";
import {
  CreatePlan,
  CreatePlanRequest,
  PlanModel,
  PlanWithPlace,
  RecurringType,
  UpdatePlanRequest,
} from "../types";
import {
  getTimestamps,
  getUpdatedTimestamps,
  toTimezoneAgnosticString,
} from "../utils/date";
import { getMongoIdOrFail } from "../utils/mongo";
import db from "./db";
import { getPlaceTimeInUtc } from "../utils/plan";
import dayjs from "dayjs";

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
    $or: [
      { "reminder.sent": false },
      { reminder: { $exists: false } }, // exclude once off plans
    ],
    google_place_id: { $exists: true },
  });

  return cursor.toArray() as unknown as PlanModel[];
}

async function listAll() {
  const cursor = await collection.find({});

  return cursor.toArray() as unknown as PlanModel[];
}

async function listForEvents(eventIds: string[]) {
  const cursor = await collection.aggregate([
    {
      $match: {
        event_id: {
          $in: eventIds.map(getMongoIdOrFail),
        },
      },
    },
    {
      $addFields: {
        converted_google_place_id: { $toObjectId: "$google_place_id" },
      },
    },
    {
      $lookup: {
        from: "google_place", // name of the other collection
        localField: "converted_google_place_id", // name of the field in this collection
        foreignField: "_id", // name of the field in the other collection
        as: "google_place", // output array field
      },
    },
    {
      $unwind: {
        path: "$google_place",
        preserveNullAndEmptyArrays: true, // keep items even if they don't have a match in the other collection
      },
    },
    {
      $sort: {
        start_date_time: -1,
      },
    },
  ]);

  return cursor.toArray() as unknown as PlanWithPlace[];
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

async function listFuturePlansWithCountdown() {
  const cursor = await collection.find({
    countdown: true,
    start_date_time: {
      $gte: new Date().toISOString(),
    },
  });

  return cursor.toArray() as unknown as PlanModel[];
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

// Move the start date time of a recurring
async function moveStartDateTimeToNextOccurrence(planId: ObjectId) {
  const plan = await find(planId.toString());
  const isRecurring = plan.recurring && plan.recurring !== "none";
  const isPast = dayjs().isAfter(plan.start_date_time);

  const recurrenceToDaysMaps: Record<RecurringType, number> = {
    none: 0,
    daily: 1,
    weekly: 7,
    fortnightly: 14,
    monthly: 30,
  };

  if (isRecurring && isPast) {
    const nextStartDateTime = dayjs(plan.start_date_time).add(
      recurrenceToDaysMaps[plan.recurring!],
      "days"
    );
    console.log(
      "Updating recurring plan start date time from",
      plan.start_date_time,
      "to",
      toTimezoneAgnosticString(nextStartDateTime)
    );
    await collection.updateOne(
      {
        _id: planId,
      },
      {
        $set: {
          start_date_time: toTimezoneAgnosticString(nextStartDateTime),
          reminder: {
            // Reset this field so we can send reminders again
            sent: false,
            sent_at: "",
          },
        },
      }
    );
  }
}

async function updateCheck(planId: string, checkId: string, checked: boolean) {
  return collection.updateOne(
    {
      _id: getMongoIdOrFail(planId),
    },
    {
      $set: {
        "check_list.$[elem].checked": checked,
      },
    },
    {
      arrayFilters: [
        {
          "elem.id": checkId,
        },
      ],
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
  listAll,
  listFuturePlansWithCountdown,

  updateReminderSent,
  updateCheck,

  moveStartDateTimeToNextOccurrence,
};
