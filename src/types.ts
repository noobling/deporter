export interface Event {
  created_by: string;
  name: string;
  photo: string;
  messages: Message[];
  participants: string[];
  expenses: Expense[];
  start_time: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEventRequest {
  name: string;
  photo: string;
  start_time: string;
}

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

export interface Media {
  uploaded_by: string;
  type: string;
}

export interface User {
  name: string;
  photo?: string;
}

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
