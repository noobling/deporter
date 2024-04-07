import { getUserIdFromToken } from "../auth";
import users from "../db/users";
import { AuthContext, UpdateUserPhotoRequest } from "../types";
import { Request, Response } from "express";

export function getUser(_: any, context: AuthContext) {
  return users.getUser(context.id!!);
}

export function updateMyPhoto(
  payload: UpdateUserPhotoRequest,
  context: AuthContext
) {
  return users.updatePhoto(context.authedUser._id, payload.photo);
}

export async function createUser(req: Request, res: Response) {
  const payload = req.body;
  try {
    const userId = await getUserIdFromToken(req);
    const exists = await users.getUserBySub(userId);
    if (exists) {
      return res.send(exists);
    }

    const created = await users.createUser({ ...payload, sub: userId });
    return res.send(created);
  } catch (err) {
    return res.status(401).send((err as any).message);
  }
}

export async function currentUser(req: Request, res: Response) {
  try {
    const userId = await getUserIdFromToken(req);
    const user = await users.getUserBySub(userId);

    return res.send({ user, loggedIn: true });
  } catch (err) {
    return res.send({ user: null, loggedIn: false });
  }
}
