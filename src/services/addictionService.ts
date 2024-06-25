import { Response } from "express";
import users from "../db/users";
import {
  Context,
} from "../types";
import { cacheGet, cacheSet } from "../utils/redis";

const daily_affirmation = "daily_affirmation_temp"
export async function getDailyAffirmation(
  _payload: any,
  res: Response,
) {
  const cache = await cacheGet(daily_affirmation)
  if (cache) {
    return res.send(cache).status(200);
  }
  const response = await fetch('https://zenquotes.io/api/today');
  const data = await response.json();
  cacheSet(daily_affirmation, data, 60 * 60 * 6);
  return res.send(data).status(200);
}