import appleSignIn from "apple-signin-auth";
import { Request } from "express";
import user from "./db/users";
import { UserResponse } from "./types";
import environment from "./utils/environment";
import { OAuth2Client } from "google-auth-library";

export async function getLoggedInUserOrThrow(
  req: Request
): Promise<UserResponse> {
  // TODO: Cache this since it is expensive and run on every query
  const { sub } = await getUserFromToken(req);
  const found = await user.getUserBySub(sub);
  if (!found) {
    throw new Unauthenticated("User not found");
  }
  return found as unknown as UserResponse;
}

export async function getUserFromToken(
  req: Request
): Promise<{ email: string | null | undefined; sub: string }> {
  // ONLY FOR TESTING
  if (environment.bypass_auth_user_id) {
    return { sub: environment.bypass_auth_user_id, email: null };
  }

  const token = req.headers["authorization"] as string;
  if (!token) {
    throw new Unauthenticated("Missing authorization token");
  }

  // TODO we may want to validate the audience as well
  try {
    if (token.startsWith("ya29")) {
      const googleAuth = new OAuth2Client();
      const result = await googleAuth.getTokenInfo(token);
      return { sub: result.sub!!, email: result.email };
    } else {
      const result = await appleSignIn.verifyIdToken(token);
      return { sub: result.sub, email: result.email };
    }
  } catch (err) {
    if (err instanceof Error) {
      console.log("Error verifying token:", err.message);
    }
    throw new Unauthenticated("Invalid token");
  }
}

export class Unauthenticated extends Error {}
