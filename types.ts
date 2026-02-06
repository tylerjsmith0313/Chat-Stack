
export enum SenderType {
  CLIENT = 'client',
  OPERATOR = 'operator'
}

export interface Message {
  id: number;
  session_id: string;
  sender_id: string;
  sender_type: SenderType;
  message_text: string;
  timestamp: string;
}

export interface Lead {
  id: number;
  uid: string;
  name: string;
  email: string;
  created_at: string;
  last_message?: string;
  tags?: string[];
  notes?: string;
}

export interface Operator {
  username: string;
  email: string;
  status: 'online' | 'away' | 'busy';
}

export interface ChatState {
  activeSession: string | null;
  messages: Message[];
  leads: Lead[];
  operator: Operator | null;
}
