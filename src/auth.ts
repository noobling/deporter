import appleSignIn from "apple-signin-auth";
import { Request } from "express";
import user from "./db/users";
import { UserResponse } from "./types";
import environment from "./utils/environment";

export async function getLoggedInUserOrThrow(
  req: Request
): Promise<UserResponse> {
  // TODO: Cache this since it is expensive and run on every query
  const userId = await getSubFromToken(req);
  const found = await user.getUserBySub(userId);
  if (!found) {
    throw new Unauthenticated("User not found");
  }
  return found as unknown as UserResponse;
}

export async function getSubFromToken(req: Request) {
  // ONLY FOR TESTING
  if (environment.bypass_auth_user_id) {
    return environment.bypass_auth_user_id;
  }

  const token = req.headers["authorization"] as string;
  if (!token) {
    throw new Unauthenticated("Missing authorization token");
  }

  // TODO we may want to validate the audience as well
  try {
    const result = await appleSignIn.verifyIdToken(token);
    return result.sub;
  } catch (err) {
    if (err instanceof Error) {
      console.log("Error verifying token:", err.message);
    }
    throw new Unauthenticated("Invalid token");
  }
}

export class Unauthenticated extends Error {}
