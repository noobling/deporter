import { Request, Response } from "express";
import { getUserFromToken } from "../utils/auth";
import users from "../db/users";
import {
  AuthContext,
  CheckTokenStatusResponse,
  UpdateUserPhotoRequest,
  UpdateUserRequest,
} from "../types";
import { cacheGet } from "../utils/redis";
import { adminSendMessage } from "../utils/admin";

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
    const token = req.headers["authorization"] as string;
    if (!token) {
      return res.send({ status: "expired_or_invalid" });
    }

    const cached = await cacheGet(token);
    if (cached) {
      return res.send({ status: "ok" });
    }

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

  const ipAddress = req.ip
  const userAgent = req.headers['user-agent']
  const sub = user.sub
  const name = user.name

  // TODO Fix hardcoded shit
  const response = await res.send(user);

  const message = `New user registered: ${name}
  userAgent: ${userAgent}
  IP: ${ipAddress}
  sub: ${sub}`

  await adminSendMessage({
    message
  })

  return response
}

export async function deleteUser(_: any, context: AuthContext) {
  return users.deleteUser(context.authedUser._id);
}
