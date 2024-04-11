import { Request, Response } from "express";
import { getUserFromToken } from "../auth";
import users from "../db/users";
import {
  AuthContext,
  UpdateUserPhotoRequest,
  UpdateUserRequest,
} from "../types";

export function getUser(_: any, context: AuthContext) {
  return users.getUser(context.id!!);
}

export function getUsers(_: any, context: AuthContext) {
  return users.getUsers();
}

export function updateMyPhoto(
  payload: UpdateUserPhotoRequest,
  context: AuthContext
) {
  return users.updatePhoto(context.authedUser._id, payload.photo);
}

/**
 * Update an existing user
 */
export async function updateUser(
  payload: UpdateUserRequest,
  context: AuthContext
) {
  return users.updateUser(context.authedUser._id, payload);
}

/**
 * Retrieves the current user if they don't exist it is their first time logging in so create one to allow other apis to work
 * e.g. media api
 */
export async function currentUser(req: Request, res: Response) {
  console.log("Getting logged in user");

  try {
    const { sub, email } = await getUserFromToken(req);
    const user = await users.getUserBySub(sub);

    if (!user) {
      console.log("Creating new user first time logging in");
      await users.createUser(sub, email ?? "");
    }

    return res.send({ user, loggedIn: true });
  } catch (err) {
    return res.send({ user: null, loggedIn: false });
  }
}
