export interface PlacesResponse {
  places: GooglePlace[];
}

export interface GooglePlace {
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
