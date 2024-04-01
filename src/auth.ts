import appleSignIn from "apple-signin-auth";
import { Request } from "express";
import user from "./db/users";
import { UserResponse } from "./types";

export async function getLoggedInUserOrThrow(
  req: Request
): Promise<UserResponse> {
  // TODO: Cache this since it is expensive and run on every query
  const decoded = await verifyAppleTokenAndDecodeFromReq(req);
  const found = await user.getUserBySub(decoded.sub);
  if (!found) {
    throw new Unauthenticated("User not found");
  }
  return found as unknown as UserResponse;
}

export async function verifyAppleTokenAndDecodeFromReq(req: Request) {
  const token = req.headers["authorization"] as string;
  if (!token) {
    throw new Unauthenticated("Missing authorization token");
  }

  // TODO we may want to validate the audience as well
  return appleSignIn.verifyIdToken(token);
}

export class Unauthenticated extends Error {}
