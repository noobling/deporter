import { FindOptions, ObjectId } from "mongodb";
import { getMongoIdOrFail } from "../utils/mongo";
import db from "./db";
import { Comment, Story, StoryCreateRequest } from "../types/storiesDto";
import { cacheGet, cacheSet } from "../utils/redis";

const collection = db.collection("story");
collection.createIndex({ created_by: 1, created_at: -1 })
collection.createIndex({ 'context.type': 1, 'context.id': 1, created_at: -1 })

async function createStory(item: StoryCreateRequest, userId: string) {
    console.log('create', item, userId)
    const story: Story = {
        ...item,
        _id: new ObjectId(),
        created_at: new Date().toISOString(),
        reactions: {}, comments: [],
        created_by: getMongoIdOrFail(userId),
    };
    await collection.insertOne(story);
    cacheSet(`user:${userId}:stories`, story, 60 * 60 * 24)
}

async function getUserStoriesMinimal(userId: string) {
    const cursor = await collection.find(
        {
            created_by: getMongoIdOrFail(userId),
        },
        {
            projection: {
                _id: 1,
                created_by: 1,
                created_at: 1,
                context: {
                    id: 1,
                    type: 1,
                },
                type: 1,
                data: 1,
            },
            sort: {
                created_at: -1,
            },
        }
    );
    return cursor.toArray() as unknown as Story[];
}


async function addStoryReaction(userId: string, reaction: string, storyId: string) {
    await collection.updateOne(
        {
            _id: getMongoIdOrFail(storyId),
        },
        {
            $addToSet: {
                [`reactions.${userId}`]: reaction,
            },
        }
    );
}

async function addStoryComment(userId: string, text: string, storyId: string) {
    const comment: Comment = {
        _id: new ObjectId(),
        context: {
            id: storyId,
            type: 'story',
        },
        text,
        created_by: userId,
        created_at: new Date().toISOString(),
        reactions: {},
        replies: [],
    }
    await collection.updateOne(
        {
            _id: getMongoIdOrFail(storyId),
        },
        {
            // @ts-ignore
            $push: {
                comments: comment,
            },
        }
    );
}

async function getStory(storyId: string, projection?: Record<string, number>) {
    const options: FindOptions = {}

    if (projection) {
        options.projection = projection
    }

    const story = await collection.findOne({
        _id: getMongoIdOrFail(storyId),
    }, options);
    return story as Story;
}


export default {
    createStory,
    getUserStoriesMinimal,
    addStoryReaction,
    getStory,
    addStoryComment,
};
