export interface Event {
  created_by: string;
  name: string;
  photo: string;
  messages: Message[];
  participants: string[];
  expenses: Expense[];
  start_time: Date;
}

export interface Message {
  sent_by: string;
  content: string;
  timestamp: Date;
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
}
