import type { ChatSession, Message } from '../types/chat';
import type { AttachmentData } from '../components/chat/ChatInput';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const chatApi = {
  // Fetch all chat sessions
  getSessions: async (): Promise<ChatSession[]> => {
    const res = await fetch(`${BASE_URL}/sessions`);
    if (!res.ok) throw new Error('Failed to fetch sessions');
    return res.json();
  },

  // Create a new session
  createSession: async (title = 'New Chat', agentId?: string): Promise<ChatSession> => {
    const res = await fetch(`${BASE_URL}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, agent_id: agentId }),
    });
    if (!res.ok) throw new Error('Failed to create new session');
    return res.json();
  },

  // Delete a session
  deleteSession: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/sessions/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete session');
  },

  // Fetch messages for a specific session
  getSessionMessages: async (sessionId: string): Promise<Message[]> => {
    const res = await fetch(`${BASE_URL}/sessions/${sessionId}/messages`);
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
  },

  // Stream chat response
  streamChatMessage: async (
    sessionId: string,
    message: string,
    attachment?: AttachmentData
  ): Promise<Response> => {
    return fetch(`${BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        prompt: message,
        attachment: attachment || null,
      }),
    });
  },
};