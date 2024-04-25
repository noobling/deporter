import { ObjectId } from "mongodb";
import { BadRequest } from "./handler";

export function getMongoIdOrFail(id: string) {
  try {
    return new ObjectId(id);
  } catch (err) {
    console.log(err);
    throw new BadRequest(`Invalid id: ${id}, where did you get this?`);
  }
}

/**
 * Casts a string or ObjectId to ObjectId, if it fails return as is.
 *
 * This is useful because we type ObjectId as string but it is ObjectId from the DB
 */
export function getMongoId(id: any): ObjectId {
  try {
    if (id instanceof ObjectId) {
      return id;
    } else {
      return new ObjectId(id);
    }
  } catch (err) {
    return id;
  }
}
