import {
  object,
  string,
  number,
  date,
  InferType,
  ObjectSchema,
  array,
  boolean,
  mixed,
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
  recurring: mixed(),
  check_list: array().of(
    object({
      id: string().required(),
      name: string().required(),
      checked: boolean().required(),
    })
  ),
});

export const updatePlanSchema: ObjectSchema<
  Omit<UpdatePlanRequest, "reminder">
> = object({
  link: string(),
  google_place_id: string(),
  note: string().required(),
  start_date_time: string().required(),
  media: array().of(string().required()).required(),
  recurring: mixed(),
  check_list: array().of(
    object({
      id: string().required(),
      name: string().required(),
      checked: boolean().required(),
    })
  ),
});

export const createPlaceSchema = object({
  note: string(),
  google_place_id: string().required(),
  event_id: string().required(),
});
