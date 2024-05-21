import db from "../db/db";

export async function cleanUp() {
  const events = db.collection("event");
  await events.updateMany(
    {},
    {
      // @ts-ignore
      $pull: {
        messages: null,
      },
    }
  );

  await events.updateMany(
    {},
    {
      // @ts-ignore
      $pull: {
        messages: {
          media: { $in: [null, undefined] },
        },
      },
    }
  );
  console.log("all done");
}

cleanUp();
