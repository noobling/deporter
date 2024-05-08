import db from "../db/db";
import { v4 as uuidv4 } from "uuid";

async function addMessageIdAndReactionsToEventMessage() {
  const events = db.collection("event");

  await events.updateMany(
    {},
    {
      $set: {
        "messages.$[].reactions": {},
        // set message uuid
        "messages.$[].id": uuidv4(),
      },
    }
  );
  console.log("Updated all messages with reactions and id");
}

addMessageIdAndReactionsToEventMessage();
