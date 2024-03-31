import { Request, Response } from "express";
import event from "./event";
import { User } from "./types";
import user from "./user";

// User API
export async function getUser(req: Request, res: Response) {
  const id = req.params.id;
  console.log("getting user", id);
  const result = await user.getUser(id);
  console.log("fond user", result);
  return res.send(result);
}
export async function createUser(req: Request, res: Response) {
  const body = req.body;
  console.log("payload", body);
  const result = await user.createUser(body);
  return res.send(result);
}

// Event API
export async function getEvent(req: Request, res: Response) {
  const id = req.params.id;
  return event.getEvent(id);
}
export async function createEvent(req: Request, res: Response) {
  const payload = req.body;
  const result = await event.createEvent(payload);
  return res.send(result);
}

export async function addEventExpense(req: Request, res: Response) {
  res.send("");
}

export async function addEventMessage(req: Request, res: Response) {}
