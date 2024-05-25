import plan from "../db/plan";
import { createPlanSchema, updatePlanSchema } from "../schemas";
import {
  AuthContext,
  CreatePlanRequest,
  Plan,
  PlansResponse,
  UpdatePlanRequest,
} from "../types";
import { adminSendMessage } from "../utils/admin";
import { getMongoId } from "../utils/mongo";

export async function createPlan(
  payload: CreatePlanRequest,
  context: AuthContext
) {
  const validated = await createPlanSchema.validate(payload);
  const id = context.id;

  const created = await plan.create({
    ...validated,
    event_id: getMongoId(id),
    created_by: getMongoId(context.authedUser._id),
  });

  await adminSendMessage({
    message: `${context.authedUser.name} created plan: ${validated.note}`,
    eventId: id,
    route_to: `/event/plan/edit?id=${created.event_id}}&planId=${created._id}`,
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

  await plan.update(planId, validated);

  const updated = await plan.find(planId);
  await adminSendMessage({
    message: `${context.authedUser.name} updated plan: ${updated?.note}`,
    eventId: updated?.event_id.toString() ?? "",
    route_to: `/event/plan/edit?id=${updated.event_id}}&planId=${updated._id}`,
  });

  return updated;
}

export async function deletePlan(_: any, context: AuthContext) {
  const planId = context.id;
  const deleted = await plan.find(planId);
  await plan.deletePlan(planId);

  await adminSendMessage({
    message: `${context.authedUser.name} deleted plan: ${deleted?.note}`,
    eventId: deleted?.event_id.toString() ?? "",
  });

  return deleted;
}
