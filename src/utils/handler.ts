import { Unauthenticated, getLoggedInUserOrThrow } from "../auth";
import { AuthContext } from "../types";
import { Request, Response } from "express";

export const handler = (
  cb: (payload: any, context: AuthContext) => Promise<any>
) => {
  return async (req: Request, res: Response) => {
    const id = req.params.id;
    const payload = req.body;
    const context: AuthContext = {
      id,
    } as AuthContext;

    try {
      const authedUser = await getLoggedInUserOrThrow(req);
      context.authedUser = authedUser;
    } catch (err) {
      return res.sendStatus(401);
    }

    try {
      const result = await cb(payload, context);
      res.send(result);
    } catch (err) {
      console.error("Unexpected error", err);
      res.status(500).send("Something went wrong");
    }
  };
};
