import plan from "../db/plan";
import { AuthContext, CreatePlanRequest, UpdatePlanRequest } from "../types";
import { getMongoId } from "../utils/mongo";

export async function createPlan(
  payload: CreatePlanRequest,
  context: AuthContext
) {
  return plan.create({
    link: payload.link,
    note: payload.note,
    event_id: getMongoId(payload.event_id),
    created_by: getMongoId(context.authedUser._id),
  });
}

export async function listPlans(_: any, context: AuthContext) {
  const eventId = context.id;
  return plan.list(eventId);
}

export async function updatePlan(
  payload: UpdatePlanRequest,
  context: AuthContext
) {
  const planId = context.id;

  plan.update(planId, payload);
}
