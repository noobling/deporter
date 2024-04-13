import { Request, Response } from "express";
import { getLoggedInUserOrThrow } from "../auth";
import { AuthContext } from "../types";

export const handler = (
  cb: (payload: any, context: AuthContext) => Promise<any>
) => {
  return async (req: Request, res: Response) => {
    const id = req.params.id;
    const queryParams = req.query;
    const payload = req.body;
    const context: AuthContext = {
      id,
      queryParams,
    } as AuthContext;

    try {
      const authedUser = await getLoggedInUserOrThrow(req);
      context.authedUser = authedUser;
    } catch (err) {
      if (err instanceof Error) {
        console.error("Returning 401 caused by", err.message);
        return res.status(401).send(err.message);
      }
      return res.status(401);
    }

    try {
      console.log(`${cb.name}()`, "payload", payload, "context", context);
      const result = await cb(payload, context);
      console.log(`${cb.name}()`, "result", result);

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
