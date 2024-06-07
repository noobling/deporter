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
export const createPlanSchema: ObjectSchema<CreatePlanRequest> = object({
  link: string(),
  google_place_id: string(),
  note: string().required(),
  start_date_time: string().required(),
  media: array().of(string().required()).required(),
});

export const updatePlanSchema: ObjectSchema<UpdatePlanRequest> = object({
  link: string(),
  google_place_id: string(),
  note: string().required(),
  start_date_time: string().required(),
  media: array().of(string().required()).required(),
});

export const createPlaceSchema: ObjectSchema<CreatePlaceRequest> = object({
  note: string().required(),
  google_place_id: string().required(),
  event_id: string().required(),
});
