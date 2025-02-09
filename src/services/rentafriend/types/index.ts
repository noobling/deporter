export interface Geo {
  lat: number;
  lng: number;
}

export interface Photo {
  id: number;
  path: string;
}

export interface Gender {
  id: number;
  gender_name: string;
  gender_pronunciation: string;
}

export interface Profile {
  id: number;
  age: number;
  fees: string;
  gender: Gender;
  organize: number;
  body_type: string;
  ethnicity: string;
  visibility: number;
  description: string;
  height_type: string;
  eye_color_type: string;
  profile_status: string;
  hair_color_type: string;
}

export interface Language {
  id: number;
  language: string;
  created_at: string;
  updated_at: string;
  laravel_through_key: number;
}

export interface Activity {
  id: number;
  created_at: string;
  updated_at: string;
  activity_name: string;
  laravel_through_key: number;
}

export interface PreferredFriendGender {
  id: number;
  user_id: number;
  gender_id: number;
  created_at: string;
  updated_at: string;
}

export interface Friend {
  id: number;
  zip: string;
  _geo: Geo;
  city: string;
  name: string;
  type: string;
  state: string;
  active: number;
  photos: Photo[];
  status: number;
  country: string;
  profile: Profile;
  reviews: any[];
  location: string;
  timezone: string;
  user_key: string;
  username: string;
  languages: Language[];
  user_type: string;
  activities: Activity[];
  blocked_by: any[];
  bookmarked: null;
  last_login: string;
  state_code: string | null;
  shared_with: any[];
  country_code: string;
  full_location: string;
  reverification: number;
  profile_photo_path: string;
  preferred_friend_genders: PreferredFriendGender[];
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface FriendsResponse {
  current_page: number;
  data: { [key: string]: Friend };
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface FriendModel {
  id: number;
  name: string;
  username: string;
  phone: string;
  age: number;
  gender: string;
  city: string;
  state: string;
  country: string;
  description: string;
  body_type: string;
  ethnicity: string;
  height: string;
  languages: string[];
  activities: string[];
  last_login: string;
  profile_url: string;
  photos: string[];
  fees: string;
}

export interface PhoneResponse {
  id: number;
  user_id: number;
  viewed_user_id: number;
  phone_number: string;
  ip: string;
  viewed_at: string;
  created_at: string;
  updated_at: string;
}
