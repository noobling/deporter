interface Event {
  created_by: string;
  name: string;
  photo: string;
  messages: Message[];
  participants: string[];
  expenses: Expense[];
  start_time: Date;
}

interface Message {
  sent_by: string;
  content: string;
  timestamp: Date;
  media: string[];
}

interface Media {
  uploaded_by: string;
  type: string;
}

interface User {
  name: string;
  photo?: string;
}

interface Expense {
  created_by: string;
  name: string;
  amount: number;
  media: string[];
  applicable_to: string[];
}
