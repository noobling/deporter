import { ObjectId } from "mongodb";
import { getMongoIdOrFail } from "../utils/mongo";
import db from "./db";
import { Story, StoryCreateRequest } from "../types/storiesDto";

const collection = db.collection("story");
collection.createIndex({ created_by: 1, created_at: -1 })
collection.createIndex({ 'context.type': 1, 'context.id': 1, created_at: -1 })

async function createStory(item: StoryCreateRequest, userId: string) {
    const story: Story = {
        ...item,
        _id: new ObjectId(),
        created_at: new Date().toISOString(),
        reactions: {}, comments: [],
        created_by: getMongoIdOrFail(userId),
    };
    await collection.insertOne(story);
}

async function getUserStories(userId: string) {
    const cursor = await collection.find(
        {
            created_by: userId,
        },
        {
            sort: {
                created_at: -1,
            },
        }
    );
    return cursor.toArray() as unknown as Story[];
}


export default {
    createStory,
    getUserStories
};
