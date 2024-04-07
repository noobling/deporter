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
}
export interface EventResponse extends Event {
  _id: string;
}
export interface CreateEventRequest {
  name: string;
  photo: string;
  start_time: string;
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
}
export interface Media {
  created_by: string;
  type: string;
  name: string;
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
}
export interface UserResponse extends User {
  _id: string;
}
export interface CreateUserRequest {
  sub: string;
  name: string;
  photo?: string;
}

export interface CurrentUserResponse {
  user: UserResponse | null;
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
  authedUser: UserResponse;
}
