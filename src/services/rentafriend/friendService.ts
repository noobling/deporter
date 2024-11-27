import { profileAsync } from "./utils/profiler";
import { Friend, FriendModel, FriendsResponse } from "./types";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import environment from "../../utils/environment";

export let supabase: SupabaseClient;
supabase = createClient(environment.supabase_url, environment.supabase_key);

function chunk<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
}

async function fetchLocationFriends(location: string): Promise<Friend[]> {
  try {
    const encodedLocation = encodeURIComponent(location);
    const CHUNK_SIZE = 5; // Process pages in chunks of 5
    
    // First fetch to get total pages
    const firstUrl = `https://rentafriend.com/search/friends-scroll?isSearch=true&location=${encodedLocation}&page=1&only_gender=-1&my_gender=-1&target_gender=-1&age_range=-1`;
    
    const firstResponse = await fetch(firstUrl);
    if (!firstResponse.ok) {
      throw new Error(`HTTP error! status: ${firstResponse.status}`);
    }
    
    const firstData: FriendsResponse = await firstResponse.json();
    const lastPage = firstData.last_page;

    // Create array of page numbers and chunk them
    const pages = Array.from({length: lastPage}, (_, i) => i + 1);
    // If CHUNK_SIZE > pages.length, chunk() will return a single chunk with all pages
    const pageChunks = chunk(pages, Math.min(CHUNK_SIZE, pages.length));
    
    const locationFriends: Friend[] = [];

    // Process chunks sequentially
    for (const pageChunk of pageChunks) {
      const chunkResults = await Promise.all(
        pageChunk.map(async (page) => {
          try {
            return await profileAsync(`Fetching ${location} page ${page}`, async () => {
              const url = `https://rentafriend.com/search/friends-scroll?isSearch=true&location=${encodedLocation}&page=${page}&only_gender=-1&my_gender=-1&target_gender=-1&age_range=-1`;
              
              const response = await fetch(url);
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              
              const data: FriendsResponse = await response.json();
              return Object.values(data.data) as unknown as Friend[];
            });
          } catch (error) {
            console.error(`Failed to fetch page ${page} for ${location}:`, error);
            return [];
          }
        })
      );

      // Add chunk results to total
      locationFriends.push(...chunkResults.flat());
      
      // Add delay between chunks
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log(`${location}: Progress - ${locationFriends.length} friends fetched`);
    }

    console.log(`${location}: Total friends fetched:`, locationFriends.length);
    return locationFriends;

  } catch (error) {
    console.error(`Failed to fetch friends for ${location}:`, error);
    return []; // Return empty array instead of failing
  }
}

export async function fetchFriendsFromRemote(locations: string[]): Promise<Friend[] | null> {
  const CHUNK_SIZE = 5;
  const allFriends: Friend[] = [];

  try {
    const locationChunks = chunk(locations, CHUNK_SIZE);
    
    for (const locationChunk of locationChunks) {
      const chunkResults = await Promise.all(
        locationChunk.map(location => fetchLocationFriends(location))
      );
      
      allFriends.push(...chunkResults.flat());
      console.log('Progress - Total friends fetched:', allFriends.length);
    }

    console.log('Final - Total friends fetched:', allFriends.length);
    return allFriends;

  } catch (error) {
    console.error(`Failed to fetch all friends returning ${allFriends.length} friends due to error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return allFriends.length > 0 ? allFriends : null;
  }
}



// Map a Friend object to CSV data format
export function mapFriendToModel(friend: Friend, phoneMap: Map<number, string>): FriendModel {
  return {
    id: friend.id,
    name: friend.name,
    username: friend.username,
    phone: phoneMap.get(friend.id) || '',
    age: friend.profile.age,
    gender: friend.profile.gender.gender_name,
    city: friend.city,
    state: friend.state,
    country: friend.country,
    description: friend.profile.description,
    body_type: friend.profile.body_type,
    ethnicity: friend.profile.ethnicity,
    height: friend.profile.height_type,
    languages: friend.languages.map(l => l.language),
    activities: friend.activities.map(a => a.activity_name),
    last_login: friend.last_login,
    profile_url: friend.profile_photo_path,
    photos: friend.photos.map(p => p.path),
    fees: friend.profile.fees || ''
  };
}

async function updateSupabasePeople(friends: Friend[]): Promise<void> {
  const CHUNK_SIZE = 100; // Supabase has limits on batch size
  const chunks = chunk(friends, CHUNK_SIZE);
  
  // Create empty phone map since we don't have phone data
  const phoneMap = new Map<number, string>();
  
  for (const friendsChunk of chunks) {
    await profileAsync(`Upserting ${friendsChunk.length} friends to Supabase`, async () => {
      const { error } = await supabase
        .from('people')
        .upsert(
          friendsChunk.map(friend => ({
            ...mapFriendToModel(friend, phoneMap),
            updated_at: new Date().toISOString()
          })),
          { onConflict: 'id' }
        );

      if (error) {
        throw new Error(`Failed to upsert friends: ${error.message}`);
      }
    });
    
    // Add a small delay between chunks to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

export async function fetchAndUpdateFriends(locations: string[]): Promise<number> {
  try {
    const friends = await fetchFriendsFromRemote(locations);
    if (!friends) {
      throw new Error('No friends data fetched');
    }
    
    await updateSupabasePeople(friends);
    console.log('Successfully updated Supabase with', friends.length, 'friends');
    return friends.length;
  } catch (error) {
    console.error('Failed to fetch and update friends:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}