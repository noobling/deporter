import { object, string, number, date, InferType } from "yup";

// Plans
export const createPlanSchema = object({
  link: string(),
  note: string(),
});

export const updatePlanSchema = object({
  link: string(),
  note: string(),
});
