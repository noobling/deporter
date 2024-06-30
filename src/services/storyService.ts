import {
  Context,
} from "../types";
import story from "../db/story";
import { MinimalStory, StoryCreateRequest, StoryGetFilter, StoryGetLastUpdateTimeFilter, StoryReactionRequest, StoryCompleteFilter, StoryCommentRequest } from "../types/storiesDto";
import { cacheGetKeys } from "../utils/redis";
import { getMongoIdOrFail } from "../utils/mongo";
import { cacheNotificationToProcess, sendPushNotification, WebsocketEventType } from "./notificationService";

export async function storyCreate(
  payload: StoryCreateRequest,
  context: Context
) {
  return story.createStory(payload, context.authedUser._id);
}
export async function storyGetMinimal(
  payload: StoryGetFilter,
  context: Context) {
  const { user_id } = payload
  return story.getUserStoriesMinimal(user_id) as unknown as MinimalStory[];
}

export async function storyReact(
  payload: StoryReactionRequest,
  context: Context) {
  const userId = context.authedUser._id
  const { story_id, reaction } = payload
  const data = await story.addStoryReaction(
    userId,
    reaction,
    story_id
  );
  await storySendNotification(story_id, userId, 'New reaction', 'Someone reacted to your story');
  return data
}

export async function storyGet(
  payload: StoryCompleteFilter,
  context: Context
) {
  const data = await story.getStory(payload.story_id);
  console.log(data, payload.story_id)
  return data
}

export async function storyCreateComment(
  payload: StoryCommentRequest,
  context: Context
) {
  const userId = context.authedUser._id
  const { story_id, text } = payload
  const data = await story.addStoryComment(
    userId,
    text,
    story_id
  );
  await storySendNotification(story_id, userId, 'New comment', text);
  return data
}

export async function storyGetLastUpdateTime(
  payload: StoryGetLastUpdateTimeFilter,
  context: Context
) {
  const { user_ids } = payload
  return (await cacheGetKeys(user_ids.map((id) => `user:${id}:stories`))).filter((key) => key !== null);
}

async function storySendNotification(
  storyId: string,
  fromUserId: string,
  title: string,
  description: string,
) {
  // fetch minimal story
  const d = await story.getStory(storyId, {
    created_by: 1,
  });
  const promises = [];
  if (d.created_by !== getMongoIdOrFail(fromUserId)) {
    const goTo = `/story/?id=${storyId}`;
    promises.push(
      cacheNotificationToProcess(d.created_by.toString(), {
        type: WebsocketEventType.ROUTING_PUSH_NOTIFICATION,
        payload: {
          goTo,
          title,
          description,
        },
      })
    );
  }
  return Promise.all(promises);
}