import { fetchAndUpdateFriends } from "../services/rentafriend/friendService";
import { locations } from "../services/rentafriend/locations";

export async function fetchFriends() {
  const friends = await fetchAndUpdateFriends(locations);
  console.log(friends);
}
