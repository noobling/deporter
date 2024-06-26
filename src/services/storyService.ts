import {
  Context,
} from "../types";
import story from "../db/story";
import { StoryCreateRequest, StoryGetFilter, StoryGetLastUpdateTimeFilter } from "../types/storiesDto";
import { cacheGetKeys } from "../utils/redis";

export async function storyCreate(
  payload: StoryCreateRequest,
  context: Context
) {
  console.log('create', payload, context.authedUser._id)

  return story.createStory(payload, context.authedUser._id);
}
export async function storyGet(
  payload: StoryGetFilter,
  context: Context) {
  const { user_id } = payload
  return story.getUserStories(user_id);
}

export async function storyGetLastUpdateTime(
  payload: StoryGetLastUpdateTimeFilter,
  context: Context
) {
  const { user_ids } = payload
  return cacheGetKeys(user_ids.map((id) => `user:${id}:stories`).flat())
}