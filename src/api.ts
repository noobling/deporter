import { Request, Response } from "express";
import event from "./event";
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
  console.log("getting event id", id);
  const result = await event.getEvent(id);
  return res.send(result);
}
export async function createEvent(req: Request, res: Response) {
  const payload = req.body;
  const result = await event.createEvent(payload);
  return res.send(result);
}

export async function addEventExpense(req: Request, res: Response) {
  const payload = req.body;
  const id = req.params.id;
  await event.addExpense(id, payload);
  const updated = await event.getEvent(id);
  return res.send(updated);
}

export async function addEventMessage(req: Request, res: Response) {
  const payload = req.body;
  const id = req.params.id;
  await event.addMessage(id, payload);
  const updated = await event.getEvent(id);
  return res.send(updated);
}
