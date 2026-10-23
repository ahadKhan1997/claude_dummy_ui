export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  sessionId: string;
  role: Role;
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  agentId?: string;
  createdAt: string;
  updatedAt: string;
}