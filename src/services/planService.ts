import plan from "../db/plan";
import { createPlanSchema, updatePlanSchema } from "../schemas";
import { AuthContext, CreatePlanRequest, UpdatePlanRequest } from "../types";
import { getMongoId } from "../utils/mongo";

export async function createPlan(
  payload: CreatePlanRequest,
  context: AuthContext
) {
  const validated = await createPlanSchema.validate(payload);
  const id = context.id;

  return plan.create({
    ...validated,
    event_id: getMongoId(id),
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
  const validated = await updatePlanSchema.validate(payload);

  plan.update(planId, validated);
}
