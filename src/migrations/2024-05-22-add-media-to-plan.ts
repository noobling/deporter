import db from "../db/db";

async function addMediaToPlan() {
  const plans = db.collection("plan");

  await plans.updateMany(
    {},
    {
      $set: {
        media: [],
      },
    }
  );

  console.log("Updated plans");
}

addMediaToPlan();
