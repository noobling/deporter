import { Request, Response } from "express";
import event from "./event";

// Event API
export async function getEvent(req: Request, res: Response) {
  return event.getEvent("");
}
export async function createEvent(req: Request, res: Response) {
  const payload = req.body;
  const result = await event.createEvent(payload);
  return res.send(result);
}

export async function addEventExpense();
