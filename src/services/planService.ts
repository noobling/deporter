import plan from "../db/plan";
import { createPlanSchema, updatePlanSchema } from "../schemas";
import {
  AuthContext,
  CreatePlanRequest,
  Plan,
  PlansResponse,
  UpdatePlanRequest,
} from "../types";
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

export async function listPlans(
  _: any,
  context: AuthContext
): Promise<PlansResponse> {
  const eventId = context.id;

  const planModels = await plan.list(eventId);

  const plans = planModels.map((planModel) => ({
    ...planModel,
    id: planModel._id,
  })) as unknown as Plan[];

  return { plans };
}

export async function updatePlan(
  payload: UpdatePlanRequest,
  context: AuthContext
) {
  const planId = context.id;
  const validated = await updatePlanSchema.validate(payload);

  plan.update(planId, validated);
}
