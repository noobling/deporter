import { profileAsync } from "./utils/profiler";
import { Friend, FriendModel, FriendsResponse } from "./types";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import environment from "../../utils/environment";

const MAX_RETRIES = 1;
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 10000;

export let supabase: SupabaseClient;
supabase = createClient(environment.supabase_url, environment.supabase_key);

function chunk<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
}

async function fetchWithRetry<T>(
  location: string,
  page: number,
  transform: (data: FriendsResponse) => T = (data) => data as unknown as T
): Promise<T | null> {
  const encodedLocation = encodeURIComponent(location);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await profileAsync(
        `Fetching ${location} page ${page}`,
        async () => {
          const url = `https://rentafriend.com/search/friends-scroll?isSearch=true&location=${encodedLocation}&page=${page}&only_gender=-1&my_gender=-1&target_gender=-1&age_range=-1`;
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data: FriendsResponse = await response.json();
          return transform(data);
        }
      );
    } catch (error) {
      console.error(
        `Attempt ${attempt}/${MAX_RETRIES} failed location: ${location} page: ${page}`,
        error instanceof Error ? error.message : "Unknown error"
      );

      if (attempt === MAX_RETRIES) {
        console.error(`All retries failed for page ${page} of ${location}`);
        return null;
      }

      const delay = calculateBackoffDelay(attempt);
      console.log(`Waiting ${Math.round(delay / 1000)}s before retry...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return null;
}

async function fetchFirstPage(
  location: string
): Promise<FriendsResponse | null> {
  return fetchWithRetry(location, 1);
}

function calculateBackoffDelay(attempt: number): number {
  // 2^attempt * BASE_DELAY_MS with jitter, capped at MAX_DELAY_MS
  const exponentialDelay = Math.min(
    Math.pow(2, attempt) * BASE_DELAY_MS,
    MAX_DELAY_MS
  );
  // Add random jitter of ±25%
  const jitter = exponentialDelay * (0.75 + Math.random() * 0.5);
  return Math.min(jitter, MAX_DELAY_MS);
}

async function fetchLocationFriends(location: string): Promise<Friend[]> {
  const CHUNK_SIZE = 1;

  const firstData = await fetchFirstPage(location);
  console.log(
    `${location} has ${firstData?.last_page} pages and ${firstData?.total} friends`
  );
  if (!firstData) return [];

  const pages = Array.from({ length: firstData.last_page }, (_, i) => i + 1);
  const pageChunks = chunk(pages, Math.min(CHUNK_SIZE, pages.length));
  const locationFriends: Friend[] = [];

  for (const pageChunk of pageChunks) {
    const chunkResults = await Promise.all(
      pageChunk.map((page) =>
        fetchWithRetry(location, page, (data) => Object.values(data.data))
      )
    );

    locationFriends.push(
      ...(chunkResults.flat().filter((item) => item !== null) as Friend[])
    );
    // Add a small delay between chunks to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log(
      `${location}: Progress - ${locationFriends.length} friends fetched`
    );
  }

  console.log(`${location}: Total friends fetched:`, locationFriends.length);
  return locationFriends;
}

export async function fetchFriendsFromRemote(
  locations: string[]
): Promise<Friend[] | null> {
  const CHUNK_SIZE = 1;
  const allFriends: Friend[] = [];

  try {
    const locationChunks = chunk(locations, CHUNK_SIZE);

    for (const locationChunk of locationChunks) {
      const chunkResults = await Promise.all(
        locationChunk.map((location) => fetchLocationFriends(location))
      );

      allFriends.push(...chunkResults.flat());
      console.log("Progress - Total friends fetched:", allFriends.length);
    }

    console.log("Final - Total friends fetched:", allFriends.length);
    return allFriends;
  } catch (error) {
    console.error(
      `Failed to fetch all friends returning ${
        allFriends.length
      } friends due to error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return allFriends.length > 0 ? allFriends : null;
  }
}

// Map a Friend object to CSV data format
export function mapFriendToModel(
  friend: Friend,
  phoneMap: Map<number, string>
): FriendModel {
  return {
    id: friend.id,
    name: friend.name,
    username: friend.username,
    phone: phoneMap.get(friend.id) || "",
    age: friend.profile.age,
    gender: friend.profile.gender.gender_name,
    city: friend.city,
    state: friend.state,
    country: friend.country,
    description: friend.profile.description,
    body_type: friend.profile.body_type,
    ethnicity: friend.profile.ethnicity,
    height: friend.profile.height_type,
    languages: friend.languages.map((l) => l.language),
    activities: friend.activities.map((a) => a.activity_name),
    last_login: friend.last_login,
    profile_url: friend.profile_photo_path,
    photos: friend.photos.map((p) => p.path),
    fees: friend.profile.fees || "",
  };
}

async function updateSupabasePeople(friends: Friend[]): Promise<void> {
  // Deduplicate friends by ID, keeping the last occurrence
  const uniqueFriends = Array.from(
    new Map(friends.map((friend) => [friend.id, friend])).values()
  );

  const CHUNK_SIZE = 100;
  const chunks = chunk(uniqueFriends, CHUNK_SIZE);

  const phoneMap = new Map<number, string>();

  for (const friendsChunk of chunks) {
    await profileAsync(
      `Upserting ${friendsChunk.length} friends to Supabase`,
      async () => {
        const { error } = await supabase.from("people").upsert(
          friendsChunk.map((friend) => ({
            ...mapFriendToModel(friend, phoneMap),
            updated_at: new Date().toISOString(),
          })),
          { onConflict: "id" }
        );

        if (error) {
          throw new Error(`Failed to upsert friends: ${error.message}`);
        }
      }
    );

    // Add a small delay between chunks to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

export async function fetchAndUpdateFriends(
  locations: string[]
): Promise<number> {
  try {
    const friends = await fetchFriendsFromRemote(locations);
    if (!friends) {
      throw new Error("No friends data fetched");
    }

    await updateSupabasePeople(friends);
    console.log(
      "Successfully updated Supabase with",
      friends.length,
      "friends"
    );
    return friends.length;
  } catch (error) {
    console.error(
      "Failed to fetch and update friends:",
      error instanceof Error ? error.message : "Unknown error"
    );
    throw error;
  }
}
