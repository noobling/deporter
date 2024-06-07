import axios from "axios";
import environment from "../utils/environment";
import { PlaceResponse, PlacesResponse } from "../googleTypes";
import { uploadToS3 } from "../utils/aws";
import { v4 as uuidv4 } from "uuid";

const googApi = axios.create({
  baseURL: "https://places.googleapis.com/v1",
  headers: {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": environment.google_api_key,
  },
});

export async function googleApiSearch(
  query: string,
  location: {
    latitude: number;
    longitude: number;
  }
) {
  const fields =
    "places.displayName,places.formattedAddress,places.location,places.iconMaskBaseUri,places.iconBackgroundColor,places.types,places.rating,places.googleMapsUri,places.primaryTypeDisplayName,places.userRatingCount,places.reviews,places.id,places.websiteUri,places.utcOffsetMinutes,places.photos";
  const result = await googApi.post<PlacesResponse>(
    `/places:searchText`,
    {
      textQuery: query,
      locationBias: {
        circle: {
          center: location,
          radius: 5000.0,
        },
      },
    },
    {
      headers: {
        "X-Goog-FieldMask": fields,
      },
    }
  );

  return result.data;
}

export async function googleApiPhoto(name: string) {
  const result = await googApi.get<{ name: string; photoUri: string }>(
    `/${name}/media`,
    {
      params: {
        // For mobile dimensions
        maxHeightPx: 800,
        maxWidthPx: 800,
        skipHttpRedirect: true,
      },
    }
  );

  return result.data;
}
