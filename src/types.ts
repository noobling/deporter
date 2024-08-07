import { ObjectId } from "mongodb";
import { OpenGraphData } from "./utils/og";
import { GooglePlaceDto, PlaceResponse } from "./googleTypes";

// ====================== EVENT ====================
export interface Event {
  created_by: string;
  name: string;
  photo: string;
  messages: Message[];
  participants: string[];
  expenses: Expense[];
  payments: Payment[];
  start_time: string;
  created_at: string;
  updated_at: string;
  /**
   * - public events are deprecated
   * - private events are default and can show up in feeds for friends
   * - restricted events only show up for participants
   */
  status?: EventStatusType;
  join_code?: string; // unique code users can use to join event

  /** Read Receipts
   * - key is the user id
   */
  read_receipts?: {
    [key: string]: {
      message_id: string;
      read_at: string;
    };
  };
  reminders?: Reminder[];
}

export interface Reminder {
  last_sent_at: string;
  frequency: "once" | "daily" | "weekly";
  type: "expense";
  created_by: string;
}

export type EventStatusType = "public" | "private" | "restricted";

export interface EventResponse extends Event {
  _id: string;
}
export interface CreateEventRequest {
  name: string;
  photo: string;
  start_time: string;
  status: EventStatusType;
}

export interface UpdateEventRequest {
  name: string;
  photo: string;
  start_time: string;
  status: EventStatusType;
}

export interface AddParticipantRequest {
  participants: string[];
}

export interface EventsResponse {
  events: EventResponse[];
}

export interface MessageReaction {
  [key: string]: string[];
}
export interface Message {
  interactions?: {
    response_to?: string; // id of the message this is a response to, for now it is the index
    poll?: {
      options: string[];
    };
  };
  reactions: MessageReaction;
  created_by: string;
  content: string;
  media: string[];
  created_at: string;
  updated_at: string;
  id: string;
  pinned?: boolean;
  route_to?: string; // path to route to in app.
}

export interface CreateMessageRequest {
  interactions?: { response_to?: string; poll?: { options: string[] } };
  content: string;
  media: string[];
  id?: string; // Nullable for backwards compatibility
  route_to?: string;
}

export interface CreateMessageReactionRequest {
  message_id: string;
  reaction: string;
  message_created_by: string;
}

export interface CreateMessageReadReceiptRequest {
  message_id: string;
}

export interface PinMessageRequest {
  message_id: string;
}

// ====================== PAYMENT ====================
export interface Payment {
  created_by: string;
  amount: number;
  media: string[];
  created_at: string;
  updated_at: string;
  paid_to: string;
}
export interface PaymentResponse extends Payment {
  _id: string;
}
export interface CreatePaymentRequest {
  amount: number;
  paid_to: string;
  media: string[];
}

// ====================== MEDIA ====================
export type MediaType = "image" | "video"; // Only image and video supported now but can be more
export interface CreateMediaRequest {
  type: MediaType;
  name: string;
  extension: string;
  exif?: string;
  mimeType?: string;
  thumbnail_media_id?: string; // Media Id of thumbnail image
}
export interface Media {
  created_by: string;
  type: MediaType;
  name: string;
  extension: string;
  s3Key?: string; // Used by google photos right now
  created_at: string;
  updated_at: string;
  eventId?: string; // Event media is part of
  exif?: string; // metadata on media from device
  address?: Object; // Contains object with address fields
  location?: Object; // Contains the coords
  thumbnail_media_id?: string; // Media Id of thumbnail image, use this to display a preview
}
export interface MediaResponse extends Media {
  _id: string;
  downloadUrl?: string;
  uploadUrl?: string;
}

// ====================== User ====================
export interface User {
  sub: string;
  name: string;
  photo?: string;
  email: string;
  friends: string[];
  created_at: string;
  updated_at: string;
}
export interface UserResponse extends User {
  _id: string;
}
export interface UpdateUserRequest {
  name?: string;
  photo?: string;
}

export interface CurrentUserResponse {
  user: UserResponse | null;
  loggedIn: boolean;
}

export interface UpdateUserPhotoRequest {
  photo: string;
}

export interface CheckTokenStatusResponse {
  status:
    | "expired_or_invalid"
    | "registration_required"
    | "missing_token"
    | "ok";
}

export interface RegisterUserRequest {
  name: string | null;
  email: string | null;
}

export interface ListFriendsResponse {
  /**
   * Users that you added as friends
   */
  yourFriends: UserResponse[];
  /**
   * Users who have added you as a friend
   */
  addedYou: UserResponse[];
}

// ====================== EXPENSE ====================
export interface Expense {
  id: ObjectId;
  payer?: string;
  created_by: string;
  name: string;
  amount: number;
  media: string[];
  applicable_to: string[];
  adjustments: {
    [key: string]: number;
  };
  created_at: string;
  updated_at: string;
}
export interface CreateExpenseRequest {
  payer?: string;
  name: string;
  amount: number;
  media: string[];
  applicable_to: string[];
}

export interface CreateExpenseAdjustmentRequest {
  name: string;
  expense_id: string;
  value: number;
}

export interface DeleteExpenseRequest {
  name: string;
  id: string;
}

export interface AddExpenseReminderRequest {
  owedToUserId: string;
  eventId: string;
  frequency: "once" | "daily" | "weekly";
}

export interface RemoveExpenseReminderRequest {
  owedToUserId: string;
  eventId: string;
}

export interface Context {
  id: string;
  queryParams: any;
  authedUser: UserResponse;
}

export interface GoogleToken {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: string;
  name: string;
  picture: string;
  given_name: string;
  iat: string;
  exp: string;
  alg: string;
  kid: string;
  typ: string;
}

export interface UserToken {
  sub: string;
  email: string | null;
  photo: string | null;
  name: string | null;
}

// Feed API
export interface FeedItem {
  media: string;
  eventId: string;
  eventName: string;
  eventPhoto: string;
  message: string;
  created_at: string;
  created_by: string;
}

// ====================== PLAN ====================

export interface BasePlan {
  /**
   * @deprecated for google_place_id now
   */
  link?: string;
  note: string;
  start_date_time: string;
  media: string[];
  google_place_id?: string | null;
  check_list?: CheckList[];
  recurring?: RecurringType;
  countdown?: boolean; // Should we show a countdown to the event, when true may be noisy
  reminder?: {
    sent: boolean;
    sent_at: string;
  };
}

export type RecurringType =
  | "none"
  | "daily"
  | "weekly"
  | "fortnightly"
  | "monthly";

export interface CheckList {
  id: string;
  name: string;
  checked: boolean;
}

export interface Plan extends BasePlan {
  id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  event_id: string;
}

export interface PlansResponse {
  plans: Plan[];
}

export interface CreatePlanRequest extends BasePlan {}
export interface CreatePlan extends BasePlan {
  created_by: ObjectId; // Mongo ID of user who created this plan
  event_id: ObjectId;
}

export interface UpdatePlanRequest extends BasePlan {}

export interface UpdateChecklistRequest {
  checked: boolean;
  id: string;
}

/**
 * PlanModel Mongo DB representation of Plan
 */
export interface PlanModel extends BasePlan {
  _id: ObjectId;
  event_id: ObjectId;
  created_by: ObjectId;
  created_at: string;
  updated_at: string;
}

export interface PlanWithPlace extends BasePlan {
  _id: ObjectId;
  google_place: GooglePlaceDto;
}

export interface SharePlanParams {
  /**
   * Path in app to route to
   */
  path: string;
}

// ====================== PLACE ====================

export interface BasePlace {
  google_place_id: string;
  note: string;
  event_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PlaceDto extends BasePlace {
  _id: string;
  google_place: GooglePlaceDto;
}

export interface Place extends Omit<BasePlace, "event_id"> {
  _id: ObjectId;
  event_id: ObjectId;
}

export interface CreatePlaceRequest {
  google_place_id: string;
  note: string;
  event_id: string;
}

export interface UpdatePlaceRequest {
  note: string;
}

// ====================== ANALYTICS ====================
export interface AnalyticViewRequest {
  /**
   * Page that was viewed
   */
  page: string;
}
