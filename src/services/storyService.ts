import {
  Context,
} from "../types";
import story from "../db/story";
import { StoryCreateRequest, StoryGetFilter } from "../types/storiesDto";

export async function storyCreate(
  payload: StoryCreateRequest,
  context: Context
) {
  return story.createStory(payload, context.authedUser._id);
}
export async function storyGet(context: Context) {
  const { user_id } = context.queryParams as StoryGetFilter
  return story.getUserStories(user_id);
}