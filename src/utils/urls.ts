import { Plan, PlanModel } from "../types";

export const urlsPlanView = (plan: PlanModel) =>
  `/event/plan/view?id=${plan._id}&eventId=${plan.event_id}`;
