import { Request, Response } from "express";
import { getUserFromToken } from "../utils/auth";
import users from "../db/users";
import {
  AuthContext,
  CheckTokenStatusResponse,
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

export async function currentUser(_: any, context: AuthContext) {
  return users.getUser(context.authedUser._id);
}

export async function checkTokenStatus(req: Request, res: Response) {
  let response: CheckTokenStatusResponse = {} as CheckTokenStatusResponse;
  try {
    const userFromToken = await getUserFromToken(req);
    const found = await users.getUserBySub(userFromToken.sub);

    if (!found) {
      response = { status: "registration_required" };
    } else {
      response = { status: "ok" };
    }
  } catch {
    response = { status: "expired_or_invalid" };
  }
  return res.send(response);
}

export async function registerUserFromToken(req: Request, res: Response) {
  const payload = req.body;
  const userFromToken = await getUserFromToken(req);
  let user = await users.getUserBySub(userFromToken.sub);

  // Make it idempotent incase the user already exists
  if (!user) {
    console.log("Creating new user first time logging in");

    user = await users.createUser({
      ...userFromToken,
      email: payload.email ?? userFromToken.email,
      name: payload.name ?? userFromToken.name,
    });
  }

  return res.send(user);
}
