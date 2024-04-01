import { verifyAppleTokenAndDecodeFromReq } from "../auth";
import users from "../db/users";
import { AuthContext } from "../types";
import { Request, Response } from "express";

export function getUser(_: any, context: AuthContext) {
  return users.getUser(context.id!!);
}

export async function createUser(req: Request, res: Response) {
  const payload = req.body;
  try {
    const token = await verifyAppleTokenAndDecodeFromReq(req);
    const created = await users.createUser({ ...payload, sub: token.sub });
    return res.send(created);
  } catch (err) {
    return res.status(401).send((err as any).message);
  }
}
