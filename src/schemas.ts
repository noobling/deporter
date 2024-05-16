import { object, string, number, date, InferType, ObjectSchema } from "yup";
import { UpdatePlanRequest } from "./types";

// Plans
export const createPlanSchema = object({
  link: string().required(),
  note: string().required(),
  start_date_time: string().datetime().required(),
});

export const updatePlanSchema: ObjectSchema<UpdatePlanRequest> = object({
  link: string().required(),
  note: string().required(),
  start_date_time: string().datetime().required(),
});
