import appleSignIn from "apple-signin-auth";
import axios from "axios";
import { Request } from "express";
import user from "../db/users";
import { UserResponse, UserToken } from "../types";
import environment from "./environment";
import { getMongoIdOrFail } from "./mongo";
import { cacheGet, cacheSet } from "./redis";

export async function getLoggedInUserOrThrow(
  req: Request
): Promise<UserResponse> {
  // Check if cached
  const token = req.headers["authorization"] ?? "";
  const cachedUser = await cacheGet(token);
  if (cachedUser) {
    console.log("Found user cached with token");
    return {
      ...cachedUser,
      _id: getMongoIdOrFail(cachedUser._id),
    } as UserResponse;
  }

  // Otherwise fetch from db
  const { sub } = await getUserFromToken(req);
  const found = await user.getUserBySub(sub);

  if (!found) {
    throw new Unauthenticated("User not found");
  }

  // Cache result
  await cacheSet(token, found);

  // Return it
  return found as unknown as UserResponse;
}

export async function getUserFromToken(req: Request): Promise<UserToken> {
  // ONLY FOR TESTING
  if (environment.bypass_auth_user_id) {
    return {
      sub: environment.bypass_auth_user_id,
      email: null,
      photo: null,
      name: null,
    };
  }

  const token = req.headers["authorization"] as string;
  if (!token) {
    throw new Unauthenticated("Missing authorization token");
  }

  // TODO we may want to validate the audience as well
  try {
    // Try apple first
    const result = await appleSignIn.verifyIdToken(token);
    return { sub: result.sub, email: result.email, photo: null, name: null };
  } catch (err) {
    try {
      // Then try google next
      const result = await getGoogleAccessTokenInfo(token);
      return result;
    } catch (err) {
      if (err instanceof Error) {
        console.log("Error verifying token:", err.message);
      }
      throw new Unauthenticated("Invalid token");
    }
  }
}

export class Unauthenticated extends Error {}

async function getGoogleAccessTokenInfo(
  accessToken: string
): Promise<UserToken> {
  const url = `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`;
  const { data } = await axios.get(url);
  return {
    sub: data.sub!!,
    email: data.email,
    photo: data.picture,
    name: data.name,
  };
}
