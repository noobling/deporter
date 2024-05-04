import db from "../db/db";
import media from "../db/media";

async function addEventIdToMedia() {
  const events = db.collection("event");
  const allEvents = await events.find({}).toArray();

  const promises = allEvents.map((event: any) => {
    const promises = event.messages.map((message: any) => {
      const promises = message.media.map(async (mediaId: string) => {
        return media.addEventId(mediaId, event._id);
      });
      return Promise.all(promises);
    });
    return Promise.all(promises);
  });

  await Promise.all(promises);
  console.log("Updated", promises.length, "events");
}

addEventIdToMedia();
