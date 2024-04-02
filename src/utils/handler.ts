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
      if (err instanceof Error) {
        return res.status(401).send(err.message);
      }
      return res.status(401);
    }

    try {
      const result = await cb(payload, context);
      res.send(result);
    } catch (err) {
      if (err instanceof BadRequest) {
        return res.status(400).send(err.message);
      }

      console.error("Unexpected error", err);
      return res.status(500).send("Something went wrong");
    }
  };
};

export class BadRequest extends Error {
  constructor(public message: string) {
    super(message);
  }
}
