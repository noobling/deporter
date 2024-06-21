import { ObjectId } from "mongodb";
import { OpenGraphData } from "../utils/og";
import { GooglePlaceDto, PlaceResponse } from "../googleTypes";

export type StoryContextType = 'event' | 'user'
export type StoryType = 'media' | 'text'

// ====================== Story ====================
export interface Comment {
    _id: ObjectId;
    context: {
        id: string;
        type: 'story' | 'comment'
    }
    text: string;
    created_by: string;
    created_at: string;
    reactions: {
        [key: string]: string[]
    }
    replies: Comment[]
}

export interface Story {
    _id: ObjectId;
    created_by: ObjectId;
    created_at: string;
    context: {
        id: string;
        type: StoryContextType
    }
    type: StoryType
    data: any
    reactions: {
        [key: string]: string[]
    }
    comments: Comment[]
}

export interface StoryCreateRequest {
    context: {
        id: string;
        type: StoryContextType
    }
    type: StoryType
    data: any
}

export interface StoryGetFilter {
    user_id: string
}

// create index on created_by and context.id

