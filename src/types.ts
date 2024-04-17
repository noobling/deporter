// Event
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
  status?: "public" | "private";
  join_code?: string; // unique code users can use to join event
}
export interface EventResponse extends Event {
  _id: string;
}
export interface CreateEventRequest {
  name: string;
  photo: string;
  start_time: string;
  status: "public" | "private";
}
export interface AddParticipantRequest {
  participants: string[];
}

export interface EventsResponse {
  events: EventResponse[];
}

// Message
export interface Message {
  created_by: string;
  content: string;
  media: string[];
  created_at: string;
  updated_at: string;
}
export interface CreateMessageRequest {
  content: string;
  media: string[];
}

// Payment
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

// Media
export interface CreateMediaRequest {
  type: string;
  name: string;
  extension: string;
}
export interface Media {
  created_by: string;
  type: string;
  name: string;
  extension: string;
  created_at: string;
  updated_at: string;
}
export interface MediaResponse extends Media {
  _id: string;
  downloadUrl?: string;
  uploadUrl?: string;
}

// User
export interface User {
  sub: string;
  name: string;
  photo?: string;
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

// Expense
export interface Expense {
  created_by: string;
  name: string;
  amount: number;
  media: string[];
  applicable_to: string[];
  created_at: string;
  updated_at: string;
}
export interface CreateExpenseRequest {
  name: string;
  amount: number;
  media: string[];
  applicable_to: string[];
}

export interface AuthContext {
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
