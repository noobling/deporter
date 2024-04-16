import { Request, Response } from "express";
import { getLoggedInUserOrThrow } from "./auth";
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

    function log(...message: any[]) {
      console.log("========================");
      const prettifyContext = {
        id: context.id,
        authedUser: {
          name: context.authedUser?.name,
          sub: context.authedUser?.sub,
        },
      };
      console.log(`${cb.name}()`, "context", prettifyContext);
      console.log(...message);
    }
    log("payload", payload);

    try {
      const authedUser = await getLoggedInUserOrThrow(req);
      context.authedUser = authedUser;
    } catch (err) {
      if (err instanceof Error) {
        log("Authentication error", err.message);
        return res.status(401).send(err.message);
      }
      return res.status(401);
    }

    try {
      const result = await cb(payload, context);
      log("result", result);

      res.send(result);
    } catch (err) {
      if (err instanceof BadRequest) {
        log("bad request", err.message);
        return res.status(400).send(err.message);
      }

      console.error("Unexpected error", err);
      log("unexpected error", err);
      return res.status(500).send("Something went wrong");
    }
  };
};

export class BadRequest extends Error {
  constructor(public message: string) {
    super(message);
  }
}
