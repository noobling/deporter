import {
  Context,
} from "../types";
import story from "../db/story";
import { MinimalStory, StoryCreateRequest, StoryGetFilter, StoryGetLastUpdateTimeFilter, StoryReactionRequest, StoryReactionsAndCommentsFilter } from "../types/storiesDto";
import { cacheGetKeys } from "../utils/redis";

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
  return story.getUserStories(user_id) as unknown as MinimalStory[];
}

export async function storyReact(
  payload: StoryReactionRequest,
  context: Context) {
  const userId = context.authedUser._id
  const { story_id, reaction } = payload
  return story.addStoryReaction(
    userId,
    reaction,
    story_id
  );
}

export async function storyGet(
  payload: StoryReactionsAndCommentsFilter,
  context: Context
) {
  const { story_id } = payload
  return story.getStory(story_id);
}

export async function storyGetLastUpdateTime(
  payload: StoryGetLastUpdateTimeFilter,
  context: Context
) {
  const { user_ids } = payload
  return (await cacheGetKeys(user_ids.map((id) => `user:${id}:stories`))).filter((key) => key !== null);
}