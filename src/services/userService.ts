import { getUserIdFromToken } from "../auth";
import users from "../db/users";
import { AuthContext } from "../types";
import { Request, Response } from "express";

export function getUser(_: any, context: AuthContext) {
  return users.getUser(context.id!!);
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

export async function currentUser(_: any, context: AuthContext) {
  return context.authedUser;
}
