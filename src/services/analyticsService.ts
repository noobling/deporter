import { Request, Response } from "express";
import { AnalyticViewRequest } from "../types";
import analytics from "../db/analytics";

export async function analyticsView(req: Request, res: Response) {
  const payload: AnalyticViewRequest = req.body;
  await analytics.addView(payload.page, {
    userAgent: req.headers["user-agent"] ?? "",
    ipAddress: req.ip ?? "",
  });
  res.send("ok");
}
