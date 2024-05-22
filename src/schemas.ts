import {
  object,
  string,
  number,
  date,
  InferType,
  ObjectSchema,
  array,
} from "yup";
import { UpdatePlanRequest } from "./types";

// Plans
export const createPlanSchema = object({
  link: string().required(),
  note: string().required(),
  start_date_time: string().datetime().required(),
  media: array().of(string().required()).required(),
});

export const updatePlanSchema: ObjectSchema<UpdatePlanRequest> = object({
  link: string().required(),
  note: string().required(),
  start_date_time: string().datetime().required(),
  media: array().of(string().required()).required(),
});
