import events from "../db/events";
import plan from "../db/plan";
import { createPlanSchema, updatePlanSchema } from "../schemas";
import {
  Context,
  CreatePlanRequest,
  Plan,
  PlanWithPlace,
  PlansResponse,
  UpdateChecklistRequest,
  UpdatePlanRequest,
} from "../types";
import { adminSendMessage } from "../utils/admin";
import { getMongoId } from "../utils/mongo";
import { urlsPlanView } from "../utils/urls";
import { ensureUserInEvent } from "./authService";

export async function createPlan(payload: CreatePlanRequest, context: Context) {
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
    route_to: urlsPlanView(created),
  });
}

export async function findPlan(_: any, context: Context) {
  const planId = context.id;
  const found = await plan.find(planId);
  await ensureUserInEvent(
    context.authedUser._id,
    found?.event_id.toString() ?? ""
  );

  return found;
}

export async function listPlans(
  _: any,
  context: Context
): Promise<PlansResponse> {
  const eventId = context.id;

  const planModels = await plan.list(eventId);

  const plans = planModels.map((planModel) => ({
    ...planModel,
    id: planModel._id,
  })) as unknown as Plan[];

  return { plans };
}

export async function listPlansForUser(_: any, context: Context) {
  const eventIds = await events.listEventIds(context.authedUser._id);
  const planModels = await plan.listForEvents(eventIds);

  const plans = planModels.map((planModel) => ({
    ...planModel,
    id: planModel._id,
  })) as unknown as PlanWithPlace[];

  return { plans };
}

export async function updatePlan(payload: UpdatePlanRequest, context: Context) {
  const planId = context.id;
  const validated = await updatePlanSchema.validate(payload);

  await plan.update(planId, validated);

  const updated = await plan.find(planId);
  await adminSendMessage({
    message: `${context.authedUser.name} updated plan: ${updated?.note}`,
    eventId: updated?.event_id.toString() ?? "",
    route_to: urlsPlanView(updated),
  });

  return updated;
}

export async function deletePlan(_: any, context: Context) {
  const planId = context.id;
  const deleted = await plan.find(planId);
  await plan.deletePlan(planId);

  await adminSendMessage({
    message: `${context.authedUser.name} deleted plan: ${deleted?.note}`,
    eventId: deleted?.event_id.toString() ?? "",
  });

  return deleted;
}

export async function planUpdateChecklist(
  payload: UpdateChecklistRequest,
  context: Context
) {
  await plan.updateCheck(context.id, payload.id, payload.checked);
}
