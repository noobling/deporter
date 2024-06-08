import {
  object,
  string,
  number,
  date,
  InferType,
  ObjectSchema,
  array,
} from "yup";
import {
  CreatePlaceRequest,
  CreatePlanRequest,
  UpdatePlanRequest,
} from "./types";

// Plans
export const createPlanSchema: ObjectSchema<
  Omit<CreatePlanRequest, "reminder">
> = object({
  link: string(),
  google_place_id: string(),
  note: string().required(),
  start_date_time: string().required(),
  media: array().of(string().required()).required(),
});

export const updatePlanSchema: ObjectSchema<
  Omit<UpdatePlanRequest, "reminder">
> = object({
  link: string(),
  google_place_id: string(),
  note: string().required(),
  start_date_time: string().required(),
  media: array().of(string().required()).required(),
});

export const createPlaceSchema = object({
  note: string(),
  google_place_id: string().required(),
  event_id: string().required(),
});
