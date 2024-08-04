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

export async function analyticsGetViews(req: Request, res: Response) {
  const page = req.query.page as string;
  const views = await analytics.getViews(page);

  res.send({
    views: views.length,
  });
}
