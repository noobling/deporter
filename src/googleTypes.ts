import { ObjectId } from "mongodb";

export interface PlacesResponse {
  places: PlaceResponse[];
}

export interface GooglePlace extends Omit<GooglePlaceDto, "_id"> {
  _id: ObjectId;
}

// Use this is preferred
export interface GooglePlaceDto extends PlaceResponse {
  _id: string;
  /**
   * This is a list of photo names that have been downloaded to S3. We lazy populate it to save costs
   */
  downloadedPhotos?: string[];
}
export interface PlaceResponse {
  id: string;
  types: string[];
  formattedAddress: string;
  location: {
    latitude: number;
    longitude: number;
  };
  displayName: {
    text: string;
  };
  rating: number;
  googleMapsUri: string;
  userRatingCount: number;
  iconMaskBaseUri: string;
  iconBackgroundColor: string;
  primaryTypeDisplayName: TextWithLanguageCode;
  reviews: Review[];
  utcOffsetMinutes: number;
  websiteUri?: string;
  photos: PlacePhoto[];
}

export interface PlacePhoto {
  name: string;
  widthPx: string;
  heightPx: string;
  authorAttributions: AuthorAttribution[];
}

export interface Review {
  name: string;
  relativePublishTimeDescription: string;
  rating: number;
  text: TextWithLanguageCode;
  originalText: TextWithLanguageCode;
  authorAttribution: AuthorAttribution;
  publishTime: string;
}

interface TextWithLanguageCode {
  text: string;
  languageCode: string;
}
interface AuthorAttribution {
  displayName: string;
  uri: string;
  photoUri: string;
}

export interface GoogPlaceDetailsResponse {
  photo: PlacePhoto[];
}
