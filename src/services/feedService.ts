import events from "../db/events";
import { Context, FeedItem } from "../types";

export async function getFeed(payload: any, context: Context) {
  const viewableEvents = await events.getEventsViewableByUser(
    context.authedUser._id
  );
  const feed: FeedItem[] = viewableEvents
    .map((event) => {
      return event.messages
        .map((message) => {
          return message.media
            .map((m) => ({
              media: m,
              eventId: event._id,
              eventName: event.name,
              eventPhoto: event.photo,
              message: message.content,
              created_at: message.created_at,
              created_by: message.updated_at,
            }))
            .flat();
        })
        .flat();
    })
    .flat();

  // Descending order
  feed.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return { feed };
}
