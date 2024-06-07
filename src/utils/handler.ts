import { Request, Response } from "express";
import { getLoggedInUserOrThrow } from "./auth";
import { Context } from "../types";
import { adminSendMessage } from "./admin";

export const handler = (
  cb: (payload: any, context: Context) => Promise<any | null | undefined>
) => {
  return async (req: Request, res: Response) => {
    const id = req.params.id;
    const queryParams = req.query;
    const payload = req.body;
    const context: Context = {
      id,
      queryParams,
    } as Context;

    function log(...message: any[]) {
      console.log("========================");
      const prettifyContext = {
        id: context.id,
        authedUser: context.authedUser,
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
        log("Authentication failed caused by:", err.message);
        return res.status(401).send(err.message);
      }
      return res.status(401);
    }

    try {
      const result = await cb(payload, context);

      res.send(result);
    } catch (err: any) {
      if (err instanceof BadRequest) {
        log("bad request", err.message);
        return res.status(400).send(err.message);
      } else if (err instanceof AuthenticationError) {
        log("authentication error", err.message);
        return res.status(401).send(err.message);
      }

      console.error("Unexpected error", err);
      log("unexpected error", err);

      adminSendMessage({
        message: `Error in ${cb.name}(): ${err?.message}`,
        eventId: "661ceba8b2463e6fca862ffb", // Developer chat
      });

      return res.status(500).send("Something went wrong");
    }
  };
};

export class BadRequest extends Error {
  constructor(public message: string) {
    super(message);
  }
}

export class AuthenticationError extends Error {
  constructor(public message: string) {
    super(message);
  }
}

/**
 * This function is purely for public facing endpoints
 * The function will pass query parameters to the payloads
 * This handler expects the callback to send a response
 * @param cb
 * @returns
 */
export function publicHander(
  cb: (payload: any, res: Response) => Promise<any | null | undefined>
) {
  return async (req: Request, res: Response) => {
    const payload = req.query;
    function log(...message: any[]) {
      console.log("PUBLIC=================");
      console.log(`${cb.name}()`);
      console.log(...message);
    }
    log("payload", payload);

    try {
      return await cb(payload, res);
    } catch (err: any) {
      if (err instanceof BadRequest) {
        log("bad request", err.message);
        return res.status(400).send(err.message);
      }
    }
  };
}
