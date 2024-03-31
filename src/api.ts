import { Request, Response } from "express";
import event from "./event";
import { User } from "./types";

// User API
export async function getUser(req: Request, res: Response) {
  const user: User = {} as User;
  return res.send(user);
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
