import appleSignIn from "apple-signin-auth";
import axios from "axios";
import { Request } from "express";
import { OAuth2Client } from "google-auth-library";
import user from "../db/users";
import { UserResponse, UserToken } from "../types";
import environment from "./environment";
import { cacheGet, cacheSet } from "./redis";

export async function getLoggedInUserOrThrow(
  req: Request
): Promise<UserResponse> {
  // Check if cached
  const token = req.headers["authorization"] ?? "";
  const cachedUser = await cacheGet(token);
  if (cachedUser) {
    console.log("Found user cached with token");
    return cachedUser as UserResponse;
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
    if (token.startsWith("ya29")) {
      const googleAuth = new OAuth2Client({});
      const result = await googleAuth.getTokenInfo(token);
      return {
        sub: result.sub!!,
        email: result.email ?? null,
        photo: null,
        name: null,
      };
    } else {
      const result = await appleSignIn.verifyIdToken(token);
      return { sub: result.sub, email: result.email, photo: null, name: null };
    }
  } catch (err) {
    try {
      const result = await getGoogleTokenInfo(token);
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

// TODO: maybe we care about expire tokens one day
async function getGoogleTokenInfo(idToken: string): Promise<UserToken> {
  const url = `https://www.googleapis.com/oauth2/v3/tokeninfo?idToken=${idToken}`;

  const { data } = await axios.get(url);
  return {
    sub: data.sub!!,
    email: data.email,
    photo: data.picture,
    name: data.name,
  };
}
