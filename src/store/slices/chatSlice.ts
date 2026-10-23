import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type{ PayloadAction } from '@reduxjs/toolkit';
import type{ ChatSession, Message } from '../../types/chat';
import { chatApi } from '../../api/chatApi';
import { readStream } from '../../utils/stream';
import type { AttachmentData } from '../../components/chat/ChatInput';

interface ChatState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  messages: Record<string, Message[]>; // Keyed by sessionId
  loadingSessions: boolean;
  loadingMessages: boolean;
  isStreaming: boolean;
  error: string | null;
}

const initialState: ChatState = {
  sessions: [],
  activeSessionId: null,
  messages: {},
  loadingSessions: false,
  loadingMessages: false,
  isStreaming: false,
  error: null,
};

// --- Async Thunks ---

// 1. Fetch all chat sessions
export const fetchSessions = createAsyncThunk('chat/fetchSessions', async () => {
  return await chatApi.getSessions();
});

// 2. Create a new chat session
export const createNewSession = createAsyncThunk(
  'chat/createNewSession',
  async ({ title, agentId }: { title?: string; agentId?: string }) => {
    return await chatApi.createSession(title, agentId);
  }
);

// 3. Fetch message history for a specific session
export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (sessionId: string) => {
    const messages = await chatApi.getSessionMessages(sessionId);
    return { sessionId, messages };
  }
);

// 4. Delete a chat session
export const deleteSession = createAsyncThunk(
  'chat/deleteSession',
  async (sessionId: string) => {
    await chatApi.deleteSession(sessionId);
    return sessionId;
  }
);

// 5. Stream chat message with optional image/document attachment
export const sendMessageStream = createAsyncThunk(
  'chat/sendMessageStream',
  async (
    {
      sessionId,
      prompt,
      attachment,
    }: { sessionId: string; prompt: string; attachment?: AttachmentData },
    { dispatch }
  ) => {
    const userMsgId = 'user-' + Date.now();
    const displayContent = attachment
      ? `[Attached ${attachment.type}: ${attachment.name}]\n${prompt}`
      : prompt;

    dispatch(
      chatSlice.actions.appendMessage({
        sessionId,
        message: {
          id: userMsgId,
          sessionId,
          role: 'user',
          content: displayContent,
          timestamp: new Date().toISOString(),
        },
      })
    );

    const assistantMsgId = 'asst-' + Date.now();
    dispatch(
      chatSlice.actions.appendMessage({
        sessionId,
        message: {
          id: assistantMsgId,
          sessionId,
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
          isStreaming: true,
        },
      })
    );

    try {
      const response = await chatApi.streamChatMessage(sessionId, prompt, attachment);
      
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      await readStream(response, (chunk) => {
        dispatch(
          chatSlice.actions.updateStreamingChunk({
            sessionId,
            messageId: assistantMsgId,
            chunk,
          })
        );
      });
    } catch (err: any) {
      dispatch(
        chatSlice.actions.updateStreamingChunk({
          sessionId,
          messageId: assistantMsgId,
          chunk: `\n[Error processing request: ${err.message || 'Stream connection failed'}]`,
        })
      );
    } finally {
      // ALWAYS release streaming lock so input box un-freezes
      dispatch(
        chatSlice.actions.finalizeStreaming({
          sessionId,
          messageId: assistantMsgId,
        })
      );
    }
  }
);

// --- Slice Definition ---

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Select active chat session
    setActiveSession(state, action: PayloadAction<string | null>) {
      state.activeSessionId = action.payload;
    },

    // Append single message into session's message list
    appendMessage(state, action: PayloadAction<{ sessionId: string; message: Message }>) {
      const { sessionId, message } = action.payload;
      if (!state.messages[sessionId]) {
        state.messages[sessionId] = [];
      }
      state.messages[sessionId].push(message);
    },

    // Update streaming assistant message chunk-by-chunk
    updateStreamingChunk(
      state,
      action: PayloadAction<{ sessionId: string; messageId: string; chunk: string }>
    ) {
      const { sessionId, messageId, chunk } = action.payload;
      const msgs = state.messages[sessionId];
      if (msgs) {
        const msg = msgs.find((m) => m.id === messageId);
        if (msg) {
          msg.content += chunk;
        }
      }
    },

    // Finalize assistant streaming state
    finalizeStreaming(
      state,
      action: PayloadAction<{ sessionId: string; messageId: string }>
    ) {
      const { sessionId, messageId } = action.payload;
      const msgs = state.messages[sessionId];
      if (msgs) {
        const msg = msgs.find((m) => m.id === messageId);
        if (msg) {
          msg.isStreaming = false;
        }
      }
      state.isStreaming = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Sessions
      .addCase(fetchSessions.pending, (state) => {
        state.loadingSessions = true;
        state.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loadingSessions = false;
        state.sessions = action.payload;
        // Automatically select the first session if none is selected
        if (action.payload.length > 0 && !state.activeSessionId) {
          state.activeSessionId = action.payload[0].id;
        }
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loadingSessions = false;
        state.error = action.error.message || 'Failed to fetch sessions';
      })

      // Create New Session (Fixes "+ New Chat" selection instantly)
      .addCase(createNewSession.fulfilled, (state, action) => {
        state.sessions.unshift(action.payload);
        state.activeSessionId = action.payload.id;
        state.messages[action.payload.id] = [];
      })

      // Fetch Session Messages
      .addCase(fetchMessages.pending, (state) => {
        state.loadingMessages = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loadingMessages = false;
        state.messages[action.payload.sessionId] = action.payload.messages;
      })
      .addCase(fetchMessages.rejected, (state) => {
        state.loadingMessages = false;
      })

      // Delete Session
      .addCase(deleteSession.fulfilled, (state, action) => {
        state.sessions = state.sessions.filter((s) => s.id !== action.payload);
        delete state.messages[action.payload];
        if (state.activeSessionId === action.payload) {
          state.activeSessionId = state.sessions[0]?.id || null;
        }
      })

      // Stream Message
      .addCase(sendMessageStream.pending, (state) => {
        state.isStreaming = true;
      });
  },
});

export const {
  setActiveSession,
  appendMessage,
  updateStreamingChunk,
  finalizeStreaming,
} = chatSlice.actions;

export default chatSlice.reducer;