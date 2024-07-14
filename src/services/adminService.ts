import { Context } from "../types";
import { Unauthenticated, isAdmin } from "../utils/auth";
import environment from "../utils/environment";
import { cacheReset } from "../utils/redis";

export async function adminCacheReset(payload: any, context: Context) {
  if (!isAdmin(context.authedUser._id)) {
    throw new Unauthenticated("Not authorised");
  }

  await cacheReset();

  return "Success";
}

export async function adminList(payload: any, context: Context) {
  return environment.admins;
}
