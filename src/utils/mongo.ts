import { ObjectId } from "mongodb";
import { BadRequest } from "./handler";

export function getMongoID(id: string) {
  try {
    return new ObjectId(id);
  } catch (err) {
    throw new BadRequest(`Invalid id: ${id}, where did you get this?`);
  }
}
