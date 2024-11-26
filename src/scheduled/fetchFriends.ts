import { fetchAndUpdateFriends } from "../services/rentafriend/friendService";
import { locations } from "../services/rentafriend/locations";

export async function fetchFriends() {
  return fetchAndUpdateFriends(locations);
}
